export interface UtilisateurRequest {
  idUtilisateur?: number;
  nom?: string
  prenom?: string;
  username?: string;
  password?: string;
  actif?: boolean;
  repeatPassword?: string;
}
