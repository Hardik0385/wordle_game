// Curated 4, 5, 6-letter valid words and mystery answer candidates for supported languages

export const MULTILANG_WORDS: Record<string, Record<number, { answers: string[]; allowed: string[] }>> = {
  'Español': {
    4: {
      answers: ['AMOR', 'VIDA', 'CASA', 'GATO', 'AZUL', 'ROSA', 'SOLO', 'LUNA', 'CIEN', 'TIEM', 'AGUA', 'FUEG', 'HORA', 'AIRE', 'NUBE', 'FLOR'],
      allowed: ['AMOR', 'VIDA', 'CASA', 'GATO', 'AZUL', 'ROSA', 'SOLO', 'LUNA', 'CIEN', 'TIEM', 'AGUA', 'FUEG', 'HORA', 'AIRE', 'NUBE', 'FLOR', 'BOCA', 'MANO', 'PELO', 'OJOS', 'CARA', 'PENA', 'PASO', 'MESA', 'VASO', 'VINO', 'ALMA', 'PISO', 'RATO', 'DIAS']
    },
    5: {
      answers: ['MUNDO', 'PLAYA', 'NOCHE', 'ARBOL', 'FUEGO', 'TIEMPO', 'CAMPO', 'VERDE', 'LIBRO', 'PERRO', 'CALLE', 'PLAZA', 'DULCE', 'SUEÑO', 'REINA', 'CIELO', 'MONTE', 'CORTO', 'BRAVO', 'LLAVE'],
      allowed: ['MUNDO', 'PLAYA', 'NOCHE', 'ARBOL', 'FUEGO', 'TIEMPO', 'CAMPO', 'VERDE', 'LIBRO', 'PERRO', 'CALLE', 'PLAZA', 'DULCE', 'SUEÑO', 'REINA', 'CIELO', 'MONTE', 'CORTO', 'BRAVO', 'LLAVE', 'AMIGO', 'BARCO', 'CANTO', 'DANZA', 'EXITO', 'FIESTA', 'GRUPO', 'HIELO', 'ISLAS', 'JOVEN', 'LINEA', 'MADRE', 'PADRE', 'NORTE', 'ORDEN', 'PODER', 'RADIO', 'SALUD', 'TORRE', 'VALOR', 'VIAJE', 'ZORRO']
    },
    6: {
      answers: ['CIUDAD', 'TIEMPO', 'CAMINO', 'VERANO', 'VIENTO', 'PUERTA', 'BLANCO', 'FUTURO', 'AMIGOS', 'MUSICA', 'CUERPO', 'PIEDRA'],
      allowed: ['CIUDAD', 'TIEMPO', 'CAMINO', 'VERANO', 'VIENTO', 'PUERTA', 'BLANCO', 'FUTURO', 'AMIGOS', 'MUSICA', 'CUERPO', 'PIEDRA', 'BOSQUE', 'CAMISA', 'DORMIR', 'ESPEJO', 'FUENTE', 'GRANDE', 'HOMBRE', 'JARDIN', 'MADERA', 'NUMERO', 'PAJARO', 'SANGRE']
    }
  },
  'Français': {
    4: {
      answers: ['AMOUR', 'LUNE', 'BLEU', 'ROSE', 'VENT', 'BEAU', 'JOUR', 'NUIT', 'EAU', 'PONT', 'VOIX', 'MAIN'],
      allowed: ['AMOUR', 'LUNE', 'BLEU', 'ROSE', 'VENT', 'BEAU', 'JOUR', 'NUIT', 'EAU', 'PONT', 'VOIX', 'MAIN', 'BOIS', 'CAFE', 'DENT', 'FAIT', 'GENS', 'HAUT', 'JEUX', 'LION', 'MERE', 'PERE', 'PAIN', 'RIRE']
    },
    5: {
      answers: ['MONDE', 'PLAGE', 'TEMPS', 'VERTE', 'LIVRE', 'CHIEN', 'FLEUR', 'REINE', 'COEUR', 'SOLEI', 'FORME', 'GRAND', 'PETIT', 'ROUGE', 'BLANC', 'POMME', 'TABLE', 'TRAIN'],
      allowed: ['MONDE', 'PLAGE', 'TEMPS', 'VERTE', 'LIVRE', 'CHIEN', 'FLEUR', 'REINE', 'COEUR', 'SOLEI', 'FORME', 'GRAND', 'PETIT', 'ROUGE', 'BLANC', 'POMME', 'TABLE', 'TRAIN', 'AMOUR', 'ARBRE', 'BOIRE', 'COURT', 'DANSE', 'ETOIL', 'FEMME', 'HOMME', 'HERBE', 'IMAGE', 'JEUNE', 'LETTRE', 'MATIN', 'NOIRE', 'PORTE', 'ROUTE', 'TERRE', 'VAGUE', 'VILLE']
    },
    6: {
      answers: ['JARDIN', 'MAISON', 'SOLEIL', 'VOYAGE', 'AMOURS', 'BATEAU', 'CHEMIN', 'ETOILE', 'OISEAU', 'RIVIERE'],
      allowed: ['JARDIN', 'MAISON', 'SOLEIL', 'VOYAGE', 'AMOURS', 'BATEAU', 'CHEMIN', 'ETOILE', 'OISEAU', 'RIVIERE', 'BONHEUR', 'CHATEAU', 'ENFANT', 'FORETS', 'NATURE', 'SAISON', 'SILENCE', 'VILLAGE']
    }
  },
  'Deutsch': {
    4: {
      answers: ['WIND', 'MOND', 'GOLD', 'BLAU', 'ROSE', 'HERZ', 'HAUS', 'BAUM', 'ZEIT', 'BERG', 'LIED', 'WALD'],
      allowed: ['WIND', 'MOND', 'GOLD', 'BLAU', 'ROSE', 'HERZ', 'HAUS', 'BAUM', 'ZEIT', 'BERG', 'LIED', 'WALD', 'BUCH', 'BROT', 'DORF', 'FELD', 'HAND', 'INSEL', 'JAHR', 'KIND', 'LICHT', 'MEER', 'NAME', 'RUHE']
    },
    5: {
      answers: ['SONNE', 'TRAUM', 'FEUER', 'BLUME', 'KRAFT', 'STADT', 'STERN', 'VOGEL', 'WOLKE', 'NACHT', 'LEBEN', 'FARBE', 'GLUCK', 'KLEIN', 'GRUEN', 'APFEL', 'WASSER'],
      allowed: ['SONNE', 'TRAUM', 'FEUER', 'BLUME', 'KRAFT', 'STADT', 'STERN', 'VOGEL', 'WOLKE', 'NACHT', 'LEBEN', 'FARBE', 'GLUCK', 'KLEIN', 'GRUEN', 'APFEL', 'WASSER', 'BODEN', 'ENGEL', 'FRIEDE', 'GEIST', 'HERBST', 'INSELN', 'KAFFEE', 'LIEBE', 'MUSIK', 'NATUR', 'PFERD', 'REGEN', 'SCHNEE', 'TISCH', 'WINTER']
    },
    6: {
      answers: ['GARTEN', 'SOMMER', 'WINTER', 'HIMMEL', 'FREUND', 'BRUDER', 'SCHULE', 'WASSER', 'STRAND', 'WUNDER'],
      allowed: ['GARTEN', 'SOMMER', 'WINTER', 'HIMMEL', 'FREUND', 'BRUDER', 'SCHULE', 'WASSER', 'STRAND', 'WUNDER', 'ARBEIT', 'FENSTER', 'HERBST', 'KAFFEE', 'KIRCHE', 'MORGEN', 'SCHNEE', 'SILBER', 'SPRACHE', 'WOLKEN']
    }
  }
};
