export interface UtilisateurResponse {
  idUtilisateur?: number;
  nom?: string;
  prenom?: string;
  username?: string;
  password?: string;
  photo?: string;
  actif?: boolean;
  dateCreation?: any;
  roles?: any [];
}
