class MediaUploaderController {
    static async mediaUpload(req, res) {
        try {
            const file = req.file;
            if (!file) {
                throw new Error("Please upload a file");
            }
            res.status(201).json({
                message: "File uploaded successfully",
                data: file.path,
            });
        } catch (error) {
            res.status(400)
            throw new Error(error.message);
        }
    }
 
}