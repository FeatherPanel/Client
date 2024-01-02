import { API } from "./config";

export const PERMISSIONS: {
	[category: string]: {
		name: string;
		subusers: boolean;
		entries: {
			[permission: string]: string;
		};
	};
} = {
	"server.power": {
		name: "Alimentation",
		subusers: true,
		entries: {
			"*": "Tout sélectionner",
			on: "Allumer le serveur",
			off: "Éteindre le serveur",
			restart: "Redémarrer le serveur",
			kill: "Forcer l'arrêt du serveur",
		},
	},
	"server.console": {
		name: "Console",
		subusers: true,
		entries: {
			"*": "Tout sélectionner",
			send: "Envoyer une commande dans la console",
			read: "Lire la console",
			history: "Voir l'historique de la console",
		},
	},
	"server.files": {
		name: "Fichiers",
		subusers: true,
		entries: {
			"*": "Tout sélectionner",
			list: "Lister les fichiers",
			read: "Lire / télécharger les fichiers",
			write: "Écrire / téléverser des fichiers",
			copy: "Copier des fichiers",
			rename: "Renommer des fichiers",
			delete: "Supprimer des fichiers",
			sftp: "Accès SFTP",
			backups: "Gérer les sauvegardes",
		},
	},
	"server.settings": {
		name: "Paramètres",
		subusers: true,
		entries: {
			"*": "Tout sélectionner",
			view: "Voir les paramètres du serveur",
			edit: "Modifier les paramètres du serveur",
		},
	},
	"server.subusers": {
		name: "Sous-utilisateurs",
		subusers: true,
		entries: {
			"*": "Tout sélectionner",
			view: "Voir les sous-utilisateurs",
			manage: "Gérer les sous-utilisateurs",
		},
	},
	user: {
		name: "Votre compte",
		subusers: false,
		entries: {
			"*": "Tout sélectionner",
			view: "Voir les informations de votre compte",
			edit: "Modifier les informations de votre compte",
		},
	},
};

export const setPermissions = async (serverId: string) => {
	let permissions = await new Promise((resolve, reject) => {
		fetch(`${API()}/servers/${serverId}/permissions`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.status == "success" && res.data) {
					resolve(res.data);
				} else {
					if (res.error && res.error == "UNAUTHORIZED")
						location.href = "/";
					reject(res.error || true);
				}
			})
			.catch((err) => {
				console.error(err);
				reject(err);
			});
	});

	if (!permissions || !Array.isArray(permissions)) return [];

	if (permissions.includes("*")) {
		let allPermissions = [];

		for (let category in PERMISSIONS) {
			for (let permission in PERMISSIONS[category].entries) {
				allPermissions.push(`${category}.${permission}`);
			}
		}

		sessionStorage.setItem(
			serverId + "_permissions",
			allPermissions.join(",") + "," + Date.now()
		);
		return allPermissions;
	}

	sessionStorage.setItem(
		serverId + "_permissions",
		permissions.join(",") + "," + Date.now()
	);

	return permissions;
};

export const getPermissions = (serverId: string | undefined = undefined) => {
	if (!serverId) serverId = location.pathname.split("/")[2];

	let permissions = sessionStorage.getItem(serverId + "_permissions");
	if (!permissions) {
		setPermissions(serverId);
		return [];
	}

	try {
		let permissionsArray = permissions.split(",");
		permissionsArray.pop();

		return permissionsArray;
	} catch (e) {
		console.error(e);
		return [];
	}
};
