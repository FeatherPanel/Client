import { API } from "./config";

export const serverStatus: {
	[key: string]: { display: string; color: string; term: string };
} = {
	online: {
		display: "En ligne",
		color: "success",
		term: "[1;32m",
	},
	offline: {
		display: "Hors ligne",
		color: "error",
		term: "[1;31m",
	},
	unknown: {
		display: "Inconnu",
		color: "warning",
		term: "[1;33m",
	},
	starting: {
		display: "Démarrage",
		color: "neutral",
		term: "[1;30m",
	},
	stopping: {
		display: "Arrêt",
		color: "neutral",
		term: "[1;30m",
	},
	restarting: {
		display: "Redémarrage",
		color: "neutral",
		term: "[1;30m",
	},
	killing: {
		display: "Arrêt forcé",
		color: "neutral",
		term: "[1;30m",
	},
};

export const getServer = async (
	serverId: string,
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/servers/${serverId}`, {
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
			return { response: null, error: err };
		});
};

export const getServers = async (
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/servers`, {
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

/* admin only */
export const getAllServers = async (
	token: string | null = sessionStorage.getItem("token")
): Promise<{ response: any; error: any }> => {
	return await fetch(`${API()}/admin/servers`, {
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
