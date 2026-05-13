export async function validateUploadedDocument(
  file: File
) {

  const formData = new FormData();

  formData.append(
    "document",
    file
  );

  const response = await fetch(

    "http://localhost:5000/validate-document",

    {
      method: "POST",

      body: formData
    }
  );

  return await response.json();
}