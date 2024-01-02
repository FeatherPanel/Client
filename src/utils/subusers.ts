import { API } from "./config";

export const getSubusers = async (
	serverId: string,
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/servers/${serverId}/users`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
		},
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
