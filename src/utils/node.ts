import { API } from "./config";

export const nodeStatus: {
	[key: string]: { display: string; color: string };
} = {
	loading: {
		display: "Chargement...",
		color: "neutral",
	},
	online: {
		display: "En ligne",
		color: "success",
	},
	offline: {
		display: "Hors ligne",
		color: "error",
	},
};

export const getNode = async (
	nodeId: number,
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/admin/nodes/get`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			nodeId: parseInt(nodeId.toString()),
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

export const getNodes = async (
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/admin/nodes/getAll`, {
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

export const pingNode = async (
	nodeId: string,
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/admin/nodes/ping`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			nodeId: nodeId,
			start: Date.now(),
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
