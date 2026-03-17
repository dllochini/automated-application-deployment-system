import api from "@/lib/api";

export const deleteBuild = (id) => api.delete(`/build/${id}`);
export const deleteAllBuilds = () => api.delete("/builds");

export const deployApp = async (payload) => {
  const result = await api.post("/deploy", payload);
  return result;
};

export const getDeployments = async () => {
  const result = await api.get("/deployments");
  return result;
};