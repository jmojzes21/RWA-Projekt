-- Creator:       MySQL Workbench 8.0.34/ExportSQLite Plugin 0.1.0
-- Author:        Josip
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2023-12-29 11:05
-- Created:       2023-10-15 12:57
PRAGMA foreign_keys = OFF;

-- BEGIN;
CREATE TABLE "tip_korisnika"(
  "id_tipa" INTEGER PRIMARY KEY NOT NULL,
  "oznaka" VARCHAR(20) NOT NULL,
  "opis" TEXT,
  CONSTRAINT "naziv_UNIQUE"
    UNIQUE("oznaka"),
  CONSTRAINT "id_tipa_UNIQUE"
    UNIQUE("id_tipa")
);
CREATE TABLE "serija"(
  "tmdb_id" INTEGER PRIMARY KEY NOT NULL,
  "naziv" VARCHAR(50) NOT NULL,
  "opis" TEXT NOT NULL,
  "broj_sezona" INTEGER NOT NULL,
  "broj_epizoda" INTEGER NOT NULL,
  "popularnost" FLOAT NOT NULL,
  "slika" VARCHAR(50),
  "homepage" VARCHAR(50),
  CONSTRAINT "tmdb_id_UNIQUE"
    UNIQUE("tmdb_id")
);
CREATE TABLE "sezona_serije"(
  "tmdb_id_sezone" INTEGER NOT NULL,
  "tmdb_id_serije" INTEGER NOT NULL,
  "naziv" VARCHAR(50) NOT NULL,
  "opis" TEXT NOT NULL,
  "broj_sezone" INTEGER NOT NULL,
  "broj_epizoda" INTEGER NOT NULL,
  "slika" VARCHAR(50),
  PRIMARY KEY("tmdb_id_sezone","tmdb_id_serije"),
  CONSTRAINT "fk_sezona_serije_serija1"
    FOREIGN KEY("tmdb_id_serije")
    REFERENCES "serija"("tmdb_id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX "sezona_serije.fk_sezona_serije_serija1_idx" ON "sezona_serije" ("tmdb_id_serije");
CREATE TABLE "korisnik"(
  "id_korisnika" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "korisnicko_ime" VARCHAR(50) NOT NULL,
  "email" VARCHAR(50) NOT NULL,
  "lozinka" CHAR(64) NOT NULL,
  "sol" CHAR(64) NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(50),
  "spol" CHAR(1),
  "datum_rodenja" CHAR(20),
  "najdraza_zivotinja" VARCHAR(40),
  "tip_korisnika" INTEGER NOT NULL,
  "totp_tajni_kljuc" CHAR(120),
  "totp_ukljuceno" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "korisnicko_ime_UNIQUE"
    UNIQUE("korisnicko_ime"),
  CONSTRAINT "id_korisnika_UNIQUE"
    UNIQUE("id_korisnika"),
  CONSTRAINT "fk_korisnik_tip_korisnika"
    FOREIGN KEY("tip_korisnika")
    REFERENCES "tip_korisnika"("id_tipa")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX "korisnik.fk_korisnik_tip_korisnika_idx" ON "korisnik" ("tip_korisnika");
CREATE TABLE "zapisi"(
  "id_zapisa" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "id_korisnika" INTEGER NOT NULL,
  "vrijeme" CHAR(20) NOT NULL,
  "vrsta_zahtjeva" CHAR(1) NOT NULL,
  "trazeni_resurs" VARCHAR(80) NOT NULL,
  "tijelo" TEXT,
  CONSTRAINT "id_zapisa_UNIQUE"
    UNIQUE("id_zapisa"),
  CONSTRAINT "fk_zapisi_korisnik1"
    FOREIGN KEY("id_korisnika")
    REFERENCES "korisnik"("id_korisnika")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX "zapisi.fk_zapisi_korisnik1_idx" ON "zapisi" ("id_korisnika");
CREATE TABLE "omiljene_serije"(
  "id_korisnika" INTEGER NOT NULL,
  "tmdb_id_serije" INTEGER NOT NULL,
  PRIMARY KEY("id_korisnika","tmdb_id_serije"),
  CONSTRAINT "fk_omiljene_serije_korisnik1"
    FOREIGN KEY("id_korisnika")
    REFERENCES "korisnik"("id_korisnika")
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "fk_omiljene_serije_serija1"
    FOREIGN KEY("tmdb_id_serije")
    REFERENCES "serija"("tmdb_id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
CREATE INDEX "omiljene_serije.fk_omiljene_serije_serija1_idx" ON "omiljene_serije" ("tmdb_id_serije");
-- COMMIT;

INSERT INTO tip_korisnika (id_tipa, oznaka, opis) VALUES
  (100, 'admin', 'Administrator'),
  (1, 'obican', 'Običan registrirani korisnik');

INSERT INTO korisnik (korisnicko_ime, email, lozinka, sol, tip_korisnika) VALUES
  ('admin', 'jmojzes21@student.foi.hr', 'kzrOfm+gkOiBpPoJYQXSunZRymVW+ckhzPAjhKTKU3A=', 'WwrO10yfOREBniZco5lHjGPME+ZIviTIi9NKkmpvKPM=', 100),
  ('obican', 'jmojzes21@student.foi.hr', '7Gql1y0wuJnhzXwZsN0ez1y44p+0SjpB6o1x2Q37zC8=', 'jYi7vy6bNB37YzQzbTxRr84QA1brXidoLSUbn3XYTho=', 1);
