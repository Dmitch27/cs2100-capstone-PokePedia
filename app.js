const API_URL = "https://pokeapi.co/api/v2/pokemon?limit=20";
let allPokemon = [];

async function fetchPokemonList() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to retrieve Pokemon list.");
    }

    const data = await response.json();

    const details = await Promise.all(
        data.results.map(async function (pokemon) {
            const detailResponse = await fetch(pokemon.url);

            if(!detailResponse.ok){
                throw new Error("Failed to retrieve " + pokemon.name);
            }
            return await detailResponse.json();
        })
    );

    return details;
}

function createPokemonData(pokemon) {
    const artwork = pokemon.sprites.other["official-artwork"]?.front_default;

    return {
        id: pokemon.id,
        name: pokemon.name,
        image: artwork || pokemon.sprites.front_default,
        types: pokemon.types.map(function (item) {
            return item.type.name;
        })
    };
}

function displayPokemon(pokemonList) {
    const container = document.querySelector("#pokemon-list");
    const status = document.querySelector("#status");

    container.replaceChildren();

    const fragment = document.createDocumentFragment();

    pokemonList.forEach(function(pokemon){
        const item = document.createElement("article");
        item.classList.add("pokemon-Card");

        if(pokemon.image) {
            const image = document.createElement("img");
            image.src = pokemon.image;
            image.alt = pokemon.name;
            image.loading = "lazy";
            item.appendChild(image);
        }

        const name = document.createElement("h3");
        name.textContent = pokemon.name;
        item.appendChild(name);

        const number = document.createElement("span");
        number.classList.add("pokemon-number");
        number.textContent = "#" + String(pokemon.id).padStart(4, "0");
        item.appendChild(number);

        const types = document.createElement("div");
        types.classList.add("pokemon-types");

        pokemon.types.forEach(function (type) {
            const label = document.createElement("span");
            label.classList.add("pokemon-type", type);

            label.textContent = type.charAt(0).toUpperCase() + type.slice(1);

            types.appendChild(label);
        });

        item.appendChild(types);

        fragment.appendChild(item);

    });

    container.appendChild(fragment);

    status.textContent = "Showing" + pokemonList.length + " Pokémon. ";
}

async function startApp() {
    const status = document.querySelector("#status");
    
    try {
        status.textContent = "Loading Pokémon...";

        const apiResults = await fetchPokemonList();
        
        allPokemon = apiResults.map(createPokemonData);

        displayPokemon(allPokemon);

    } catch (error) {
        console.error("PokéMobile error:", error);
        status.textContent =
            "Unable to load Pokémon. Please try again later.";
    }
}

startApp();