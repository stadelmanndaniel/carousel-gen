// app/api/slides-download/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/service';
import archiver from 'archiver';
import { Writable } from 'stream';

// Helper to convert a stream into a buffer
function streamToBuffer(stream: archiver.Archiver): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const writable = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk as Buffer);
                callback();
            },
            final(callback) {
                resolve(Buffer.concat(chunks));
                callback();
            }
        });

        // Pipe the archiver to the Writable stream
        stream.pipe(writable);

        // Handle errors on the streams
        stream.on('error', reject);
        writable.on('error', reject);
    });
}


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (!userId || !projectId) {
        return NextResponse.json({ error: 'Missing userId or projectId' }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient(); // Use a service role client to bypass RLS for this specific task
    const storageBucket = 'carousels';
    const projectPath = `${userId}/${projectId}/preview/`;

    try {
        // 1. List all slide files in the 'preview/' subfolder
        const { data: files, error: listError } = await supabase.storage
            .from(storageBucket)
            .list(projectPath, { 
                limit: 100, 
                offset: 0, 
                sortBy: { column: 'name', order: 'asc' } 
            });

        if (listError) throw listError;
        
        const slideFiles = files.filter(f => f.name.endsWith('.png') && f.name.startsWith('slide_'));

        if (slideFiles.length === 0) {
            return NextResponse.json({ error: 'No slides found to zip.' }, { status: 404 });
        }

        // 2. Initialize the archiver
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level
        });

        // 3. Download and add each file to the archive
        const downloadPromises = slideFiles.map(async (file) => {
            const filePath = `${projectPath}${file.name}`;
            const { data: fileData, error: downloadError } = await supabase.storage
                .from(storageBucket)
                .download(filePath);

            if (downloadError) {
                console.error(`Failed to download ${filePath}:`, downloadError);
                return; // Skip failed downloads
            }

            // The archiver expects a Buffer or Stream
            if (fileData) {
                // Convert the Blob to a Node.js Buffer
                const arrayBuffer = await fileData.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer

                // Append the buffer to the archive
                archive.append(buffer, { name: file.name });
            }
        });

        await Promise.all(downloadPromises);

        // 4. Finalize the archive (triggering the 'finish' event)
        archive.finalize();

        // 5. Convert the archive stream to a buffer
        const zipBuffer = await streamToBuffer(archive);

        // 6. Send the buffer as the file response. 
        // FIX: Create a Uint8Array view from the Node Buffer to satisfy the BodyInit type requirement.
        // This is a standard and robust way to use Node Buffers in Web APIs.
        const zipBody = new Uint8Array(zipBuffer);

        return new NextResponse(zipBody, { // Pass the Uint8Array here
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="carousel-${projectId.substring(0, 8)}.zip"`,
                // Content-Length should use the original Buffer length
                'Content-Length': zipBuffer.length.toString(), 
            },
        });

    } catch (error) {
        console.error('Error zipping files:', error);
        return NextResponse.json({ error: 'Internal Server Error during file zipping.' }, { status: 500 });
    }
}