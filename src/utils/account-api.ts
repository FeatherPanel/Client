import { API } from "./config";

export const getApiCredentials = async (
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/api-credentials`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "GET",
	})
		.then((res) => res.json())
		.then((res) => {
			if (res.status == "success" && res.data) {
				return { response: res.data, error: null };
			} else {
				if (res.error && res.error == "UNAUTHORIZED")
					location.href = "/";
				return { response: null, error: res.error || true };
			}
		})
		.catch((err) => {
			console.error(err);
			return { response: null, error: err };
		});
};
