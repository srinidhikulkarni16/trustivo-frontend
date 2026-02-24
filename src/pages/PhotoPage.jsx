import Upload from "../components/Upload";

export default function PhotoPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Image</h1>

      <Upload
        acceptedFormats="image/*"
        label="Image"
      />
    </div>
  );
}