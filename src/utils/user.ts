import { API } from "./config";

export const getUser = (
	token: string | null = sessionStorage.getItem("token"),
	noredirect: boolean = false
) => {
	if (!token) {
		sessionStorage.removeItem("token");
		if (!noredirect) location.href = "/";
		return null;
	}

	let decoded = decodeJWT(token);

	if (decoded) {
		return decoded;
	} else {
		sessionStorage.removeItem("token");
		if (!noredirect) location.href = "/";
		return null;
	}
};

export const decodeJWT = (jwt: string) => {
	try {
		let payload = JSON.parse(atob(jwt.split(".")[1]));

		if (payload) {
			return payload;
		} else {
			return null;
		}
	} catch {
		return null;
	}
};

/* admin only */
export const getUserFromId = (
	userId: string | number
): Promise<{ response: any; error: any }> => {
	return fetch(`${API()}/admin/users/get`, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
		method: "POST",
		body: JSON.stringify({
			userId: typeof userId == "string" ? parseInt(userId) : userId,
		}),
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

export const getAllUsers = async (
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return fetch(`${API()}/admin/users/getAll`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "POST",
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
