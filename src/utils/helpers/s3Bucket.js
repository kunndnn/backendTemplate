import AWS from 'aws-sdk';

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, AWS_BUCKET } = process.env;
// Configure AWS SDK
AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_DEFAULT_REGION,
});

const s3 = new AWS.S3();

// save file in s3
export const fileUploadToS3 = async (base64Document) => {
    try {
        // Split the Base64 data
        const base64File = base64Document.split(';base64,');

        // Check if Base64 format is valid
        if (base64File.length !== 2) throw new Error('Invalid Base64 format');

        // Extract file type
        const mimeType = base64File[0].split(':')[1];
        const fileType = mimeType.split('/')[1].toLowerCase();

        // Check for supported file types
        const supportedTypes = ['jpeg', 'jpg', 'png', 'pdf', 'x-icon', 'svg+xml'];
        if (!supportedTypes.includes(fileType)) throw new Error('Unsupported file type');

        // Generate a unique file name
        const extension = fileType === 'svg+xml' ? 'svg' : fileType; // Handle SVG files
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

        // Decode Base64 content
        const fileContent = Buffer.from(base64File[1], 'base64');

        // Upload the file to S3
        const params = {
            Bucket: AWS_BUCKET, // Replace with your bucket name
            Key: `documents/${fileName}`, // File path in S3 bucket
            Body: fileContent,
            ContentType: mimeType,
        };

        const uploadResult = await s3.upload(params).promise();
        return {
            status: true,
            message: 'Document uploaded successfully',
            url: uploadResult.Location,
            fileType: fileType,
            fileName: fileName,
        };
    } catch (error) {
        console.error('Error uploading file:', error.message);
        return { status: false, message: error.message, };
    }
}

//delete file from s3
export const deleteFileFromS3 = async (fileKey) => {
    try {
        const params = { Bucket: AWS_BUCKET, Key: fileKey };
        await s3.deleteObject(params).promise();
        return { status: true, message: 'File deleted successfully', };
    } catch (error) {
        console.error('Error deleting file:', error.message);
        return { status: false, message: error.message, };
    }
}
