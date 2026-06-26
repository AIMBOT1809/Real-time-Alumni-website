export async function validateUploadedDocument(
  file: File
) {
  console.log("Uploading idCard file:", file);

  const formData = new FormData();
  formData.append("idCard", file);

  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/verify-id`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log("verify-id response:", result);

  return result;
}