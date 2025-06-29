import {CityAPI,WeatherAPI,WorldTimeAPI,PhoneAPI,CountryAPI} from "./types.ts"
import { GraphQLError } from "graphql";

export const getTemperature = async (lat:string, lon:string): Promise<number> => {
    const API_KEY = Deno.env.get("API_KEY");
    if(!API_KEY) throw new Error("Api key needed");

    const url = `https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`;
    const data = await fetch(url,
        {
            headers:{
                "X-Api-Key":API_KEY
            }
        }
    );
    if(!data.ok) throw new Error("No weather fetch");

    const response:WeatherAPI = await data.json();
    return response.temp;
}

export const getCountryName = async(code:string):Promise<string> => {
     const API_KEY = Deno.env.get("API_KEY");
    if(!API_KEY) throw new Error("Api key needed");
    
    const countryUrl = `https://api.api-ninjas.com/v1/country?name=${code}`
    const countryData = await fetch(countryUrl,
        {
            headers:{
                "X-Api-Key":API_KEY
            }
        }
    )
    if(countryData.status!==200) throw new GraphQLError("Api ninja error");

    const countryResponse:CountryAPI = await countryData.json();
    return countryResponse[0].name;
}

export const getCityData = async (city:string):Promise<Array<{latitude:string; longitude:string; country:string}>> => {
    const API_KEY = Deno.env.get("API_KEY");
    if(!API_KEY) throw new Error("Api key needed");

    const url = `https://api.api-ninjas.com/v1/city?name=${city}`;
    const data = await fetch(url,
        {
            headers:{
                "X-Api-Key":API_KEY
            }
        }
    );
    if(!data.ok) throw new Error("No city fetch");

    const response:CityAPI = await data.json();
    const result = await Promise.all(
        response.map(async (city) => {
            const country = await getCountryName(city.country);
            return {latitude: city.latitude, longitude: city.longitude, country};
        })
    )
    return result;
}

export const getWorldTime = async(lat:string, lon:string): Promise<string> => {
    const API_KEY = Deno.env.get("API_KEY");
    if(!API_KEY) throw new Error("Api key needed");

    const url = `https://api.api-ninjas.com/v1/worldtime?lat=${lat}&lon=${lon}`;
    const data = await fetch(url,
        {
            headers:{
                "X-Api-Key":API_KEY
            }
        }
    );
    if(!data.ok) throw new Error("No world time fetch");

    const response:WorldTimeAPI = await data.json();
    return response.hour + ":" + response.minute;
}

export const getPhoneData = async (phone:string): Promise<PhoneAPI> => {
    const API_KEY = Deno.env.get("API_KEY");
    if(!API_KEY) throw new Error("Api key needed");

    const url = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;
    const data = await fetch(url,
        {
            headers:{
                "X-Api-Key":API_KEY
            }
        }
    );
    if(!data.ok) throw new Error("No phone data fetch");

    const response:PhoneAPI = await data.json();
    return response;

}