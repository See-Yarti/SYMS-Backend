import multer from 'multer';
import { v2 as Cloudinary } from 'cloudinary';
import { Request } from 'express';
import fs from 'fs';
import Locals from '@/providers/Locals';

class Multer {
  constructor() {
    Cloudinary.config({
      cloud_name: Locals.config().CLOUDINARY_NAME,
      api_key: Locals.config().CLOUDINARY_API_KEY,
      api_secret: Locals.config().CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  // private storage = multer.diskStorage({
  //   destination: function (req: Request, file: Express.Multer.File, cb) {
  //     cb(null, './public/temp');
  //   },
  //   filename: function (req: Request, file: Express.Multer.File, cb) {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //     cb(null, file.fieldname + '-' + uniqueSuffix);
  //   },
  // });
  private storage = multer.memoryStorage();
  public routeUpload = multer({ storage: this.storage });

  public async fileUpload(file: string): Promise<string | null> {
    try {
      console.log('🚀 File to upload:', file);
      if (!file) return null;

      const result = await Cloudinary.uploader.upload(file, {
        folder: Locals.config().CLOUDINARY_FOLDER_NAME,
        resource_type: 'auto',
      });
      console.log('Upload Result:', result);
      console.log('✅ File uploaded to Cloudinary:', result.url);

      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log('🗑️ Local file cleaned up:', file);
      }

      return result.url;
    } catch (error) {
      console.error('❌ Error uploading to Cloudinary:', error);

      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log('🗑️ Local file cleaned up after error:', file);
      }

      return null;
    }
  }

  public async BufferFileUpload(fileBuffer: Buffer, fileName: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const uploadStream = Cloudinary.uploader.upload_stream(
        {
          folder: Locals.config().CLOUDINARY_FOLDER_NAME,
          resource_type: 'auto',
          public_id: fileName.split('.')[0], // Remove extension
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary Upload Error:', error);
            reject(null);
          } else {
            console.log('✅ File uploaded to Cloudinary:', result?.url);
            resolve(result?.url || null);
          }
        },
      );
  
      uploadStream.end(fileBuffer); // Upload the buffer
    });
  }
  
}

export default Multer;
