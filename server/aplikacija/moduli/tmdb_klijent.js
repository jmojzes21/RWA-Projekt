class TMDBKlijent {
  _apiKljuc;
  _bazicniURL = 'https://api.themoviedb.org/3';

  postaviApiKljuc(apiKljuc) {
    this._apiKljuc = apiKljuc;
  }

  async pretraziSerije(trazi, stranica) {
    return this._dohvatiResurs('/search/tv', {
      query: trazi,
      include_adult: false,
      language: 'en-US',
      page: stranica,
    });
  }

  async dohvatiDetaljeSerije(idSerije) {
    return this._dohvatiResurs(`/tv/${idSerije}`, {
      language: 'en-US',
    });
  }

  prilagodiTmdbDetaljeSerije = (serijaTmdb) => {
    let serija = {
      tmdb_id: serijaTmdb.id,
      naziv: serijaTmdb.name,
      opis: serijaTmdb.overview,
      broj_sezona: serijaTmdb.number_of_seasons,
      broj_epizoda: serijaTmdb.number_of_episodes,
      popularnost: serijaTmdb.popularity,
      slika: serijaTmdb.poster_path,
      homepage: serijaTmdb.homepage,
    };

    let sezone = [];

    for (let s of serijaTmdb.seasons) {
      sezone.push({
        tmdb_id_sezone: s.id,
        tmdb_id_serije: serija.tmdb_id,
        naziv: s.name,
        broj_sezone: s.season_number,
        broj_epizoda: s.episode_count,
        opis: s.overview,
        slika: s.poster_path,
      });
    }

    serija.sezone = sezone;
    return serija;
  };

  async _dohvatiResurs(resurs, parametri) {
    let zahtjev = `${this._bazicniURL}${resurs}?api_key=${this._apiKljuc}`;
    for (let p in parametri) {
      zahtjev += `&${p}=${parametri[p]}`;
    }

    let odgovor = await fetch(zahtjev);
    return await odgovor.json();
  }
}

module.exports = TMDBKlijent;
