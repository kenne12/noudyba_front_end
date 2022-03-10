export interface MembreResponse {
  idMembre: number,
  code: string,
  nom: string,
  prenom: string,
  contact: string,
  photo: string,
  state: boolean,
  ville: {
    idVille: number,
    nom: string
  }
}
