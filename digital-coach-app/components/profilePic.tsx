/**
 * Component used to handle uploading a profile picture that's hosted in Cloudinary.
 */
import { useState } from "react";

export default function CloudTest() {
    const host = typeof window !== "undefined" ? "localhost:8000" : "api";
    const cloudinaryURL = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const [file, setFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string>(""); // previewing image
    const [isUploading, setIsUploading] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const file = e.target.files[0];        
        setFile(file);
        // setImageURL(URL.createObjectURL(file));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // stop form submission
        if (!file) return; // if there isn't a file then return
        setIsUploading(true);
        const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
        if (api_key == undefined) throw `Missing Cloudinary API key.`;  
        try {
            const apiResponse = await fetch(`http://${host}/api/user/profilePic`);
            const { signature, timestamp } = await apiResponse.json(); // extract signature and timestamp
            const formData = new FormData(); // create the form data needed for Cloudinary Upload API request
            formData.append("file", file); // add the file to upload
            formData.append("api_key", api_key);
            formData.append("timestamp", timestamp)
            formData.append("signature", signature);
            // formData.append("upload_preset", `${process.env.NEXT_PUBLIC_UPLOAD_PRESET}`); // upload preset defined in Cloudinary console (optional for signed uploads)

            const cloudResponse = await fetch(cloudinaryURL, {
                method: "POST",
                body: formData
            });
            const data = await cloudResponse.json();
            if (cloudResponse.ok) {
                console.log("Upload successful");
                setImageURL(data.secure_url);
            } else {
                console.error(`Upload failed: ${data.error.message}`);
            }
            
        } catch (e) {
            console.error(`Error uploading image: ${e}`);
        } finally {
            setIsUploading(false);
        }

    }


    return (
        <div>
            <h1>Cloudinary Test Page</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="avatar">
                    Profile Picture:  
                </label>
                <input type="file" id="avatar" onChange={handleFileChange}/>

                <input type="submit" value={isUploading ? "Uploading..." : "Submit"}/>
            </form>
            {imageURL && 
                <div className="preview">
                    <p>Upload Sucessful!</p>
                    <img src={imageURL} alt="Preview picture" />
                </div>
            }
        </div>
    )
}