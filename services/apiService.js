import api from "@/lib/api";

export const deleteBuild = (id) => api.delete(`/${id}`);
export const deleteAllBuilds = () => api.delete("/");

export const deployApp = async (payload) => {
  const result = await api.post("/", payload);
  return result;
};

export const getDeployments = async () => {
  const result = await api.get("/");
  return result;
};