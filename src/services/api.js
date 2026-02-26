import axios from "axios";

//axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

//request interceptor/attach jwt automatically
api.interceptors.request.use((config)=>{
  const token=localStorage.getItem("accessToken");
  if(token){
    config.headers.Authorization=`Bearer ${token}`;
  }
  return config;
});

//response interceptor/ auto logout on expiry
api.interceptors.response.use(
  (response)=>response,
  (error)=>{
    if(error.response?.status===401){
      localStorage.removeItem("accessToken");
      window.location.href="/login";
    }
    return Promise.reject(error);
  }
);

//upload PDF
export const uploadDocument=(formData)=>
  api.post("/document/upload", formData,{
    headers:{
      "Content-Type":"multipart/form-data",
    },
  });

//signature apis:

//save position
export const saveSignature = (data) => 
  api.post("/signatures",data);

//get sign of doc
export const getSignature = (docId) => 
  api.post("/signatures",data);

//embed sign into pdfs
export const signSignature = (payload) => 
  api.post("/signatures",data);


//download signed pdf
export const downloadSignedPdf =
async (payload) => {

  const response =
    await signDocument(payload);

  const url =
    window.URL.createObjectURL(
      new Blob([response.data])
    );

  const link =
    document.createElement("a");

  link.href = url;
  link.setAttribute(
    "download",
    "signed-document.pdf"
  );

  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;