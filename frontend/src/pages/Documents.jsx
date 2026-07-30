import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Documents() {
  const [customerId, setCustomerId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomers(data ?? []);
  }

  async function fetchDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select(`
        *,
        customers(name)
      `)
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDocuments(data ?? []);
  }

 async function handleUploadDocument(event) {
  event.preventDefault();

  if (!customerId || !documentType || !selectedFile) {
    setMessage("Please select a customer, document type, and file.");
    return;
  }

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (!allowedTypes.includes(selectedFile.type)) {
    setMessage("Only PDF, JPG, JPEG and PNG files are allowed.");
    return;
  }

  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (selectedFile.size > maxSize) {
    setMessage("File size must be less than 5 MB.");
    return;
  }

  setUploading(true);
  setMessage("Uploading document...");

  const safeFileName = selectedFile.name.replaceAll(" ", "_");

  const storagePath =
    `${customerId}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, selectedFile);

  if (uploadError) {
    setMessage(uploadError.message);
    setUploading(false);
    return;
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  const { error: databaseError } = await supabase
    .from("documents")
    .insert([
      {
        customer_id: Number(customerId),
        document_type: documentType,
        file_name: selectedFile.name,
        file_path: publicUrl,
        uploaded_at: new Date().toISOString(),
      },
    ]);

  if (databaseError) {
    await supabase.storage
      .from("documents")
      .remove([storagePath]);

    setMessage(databaseError.message);
    setUploading(false);
    return;
  }

  setMessage("Document uploaded successfully.");

  setCustomerId("");
  setDocumentType("");
  setSelectedFile(null);

  const fileInput = document.getElementById("document-file");

  if (fileInput) {
    fileInput.value = "";
  }

  setUploading(false);

  await fetchDocuments();
}

  async function handleDownloadDocument(document) {
  const publicMarker = "/storage/v1/object/public/documents/";

  const storagePath = document.file_path.includes(publicMarker)
    ? document.file_path.split(publicMarker)[1]
    : "";

  if (!storagePath) {
    setMessage("Could not find the file path.");
    return;
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .download(storagePath);

  if (error) {
    setMessage(error.message);
    return;
  }

  const downloadUrl = URL.createObjectURL(data);
  const link = window.document.createElement("a");

  link.href = downloadUrl;
  link.download = document.file_name;
  link.click();

  URL.revokeObjectURL(downloadUrl);
}

  async function handleDeleteDocument(document) {
    const confirmed = window.confirm(
      `Delete ${document.file_name}?`
    );

    if (!confirmed) {
      return;
    }

    const publicMarker = "/storage/v1/object/public/documents/";
    const storagePath = document.file_path.includes(publicMarker)
      ? document.file_path.split(publicMarker)[1]
      : "";

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([storagePath]);

      if (storageError) {
        setMessage(storageError.message);
        return;
      }
    }

    const { error: databaseError } = await supabase
      .from("documents")
      .delete()
      .eq("id", document.id);

    if (databaseError) {
      setMessage(databaseError.message);
      return;
    }

    setMessage("Document deleted successfully.");
    fetchDocuments();
  }

  useEffect(() => {
    fetchCustomers();
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Document Management
            </h1>

            <p className="mt-1 text-slate-600">
              Upload, view, download, and manage customer documents.
            </p>
          </div>

          <Link
            to="/customer-dashboard"
            className="inline-flex w-fit rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-700">
            Upload Document
          </h2>

          <form
            onSubmit={handleUploadDocument}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Customer</option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={documentType}
              onChange={(event) =>
                setDocumentType(event.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Document Type</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Driving Licence">
                Driving Licence
              </option>
              <option value="Policy Document">
                Policy Document
              </option>
              <option value="Claim Document">
                Claim Document
              </option>
            </select>

            <input
              id="document-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 md:col-span-2"
              required
            />

            <p className="text-sm text-slate-500 md:col-span-2">
              Allowed formats: PDF, JPG, JPEG and PNG.
            </p>

            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:col-span-2"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm font-medium text-slate-700">
              {message}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold text-slate-700">
            Uploaded Documents
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50 text-sm text-slate-600">
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="border-b text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {document.customers?.name ??
                        `Customer ID: ${document.customer_id}`}
                    </td>

                    <td className="px-4 py-3">
                      {document.document_type}
                    </td>

                    <td className="px-4 py-3">
                      {document.file_name}
                    </td>

                    <td className="px-4 py-3">
                      {document.uploaded_at
                        ? new Date(
                            document.uploaded_at
                          ).toLocaleString()
                        : "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={document.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                        >
                          View
                        </a>

                      <button
  type="button"
  onClick={() => handleDownloadDocument(document)}
  className="rounded-lg bg-green-600 px-3 py-1.5 text-white hover:bg-green-700"
>
  Download
</button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteDocument(document)
                          }
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {documents.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No documents uploaded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documents;