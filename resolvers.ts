import { RestaurantModel, WeatherAPI, WorldTimeAPI, PhoneAPI, CityAPI, CountryAPI } from "./types.ts"
import { GraphQLError } from "graphql";
import { Collection, ObjectId } from "mongodb";
import { getCountryName} from "./utils.ts"

type Context = {
    RestaurantCollection:Collection<RestaurantModel>;
}

export const resolvers = {
    Restaurant:{
        id: (parent:RestaurantModel)=>{
            const id = parent._id!.toString();
            return id;
        },
        address: (parent:RestaurantModel) => {
            return parent.address + ", " + parent.city + ", " + parent.country;
        },
        temperature: async(parent:RestaurantModel) => {
            const {latitude, longitude} = parent;
            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new Error("Api key needed");
            
            const url = `https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`;
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
        },
        localtime: async(parent:RestaurantModel) => {
            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new Error("Api key needed");
        
            const url = `https://api.api-ninjas.com/v1/worldtime?lat=${parent.latitude}&lon=${parent.longitude}`;
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
    },

    Query:{
        getRestaurant:async(_:unknown, args:{id:string},ctx:Context): Promise<RestaurantModel|null> => {
            return await ctx.RestaurantCollection.findOne({_id:new ObjectId(args.id)});
        },
        getRestaurants:async(_:unknown, args:{city:string},ctx:Context): Promise<RestaurantModel[]> => {
            return await ctx.RestaurantCollection.find({city: args.city}).toArray();
        }
    },

    Mutation:{
        addRestaurant: async(_:unknown, args:{name:string, address:string, phone:string, city:string},ctx:Context):Promise<RestaurantModel> => {
            const {name, address, phone,city} = args;
            const phoneExists = await ctx.RestaurantCollection.findOne({phone});
            if(phoneExists) throw new GraphQLError("Phone already exists");

            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new Error("Api key needed");
            
            const phoneUrl = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;
            const phoneData = await fetch(phoneUrl,
                {
                    headers:{
                        "X-Api-Key":API_KEY
                    }
                }
            );
            if(!phoneData.ok) throw new Error("No phone data fetch");
            
            const phoneResponse:PhoneAPI = await phoneData.json();
                
            if(!phoneResponse.is_valid) throw new GraphQLError("Phone is not valid");

            const cityUrl = `https://api.api-ninjas.com/v1/city?name=${city}`;
            const cityData = await fetch(cityUrl,
                {
                    headers:{
                        "X-Api-Key":API_KEY
                    }
                }
            );

            if(!phoneData.ok) throw new Error("No city data fetch");
            const cityResponse:CityAPI = await cityData.json();

            const result = await Promise.all ( 
                cityResponse.map(
                    async (city) => {
                        const countryName = await getCountryName(city.country);
                        return {latitude:city.latitude, longitude:city.longitude, country:countryName}
                    }
                )
            )

            const cityExists = result.find(
                (city) => city.country === phoneResponse.country
            )

            if(!cityExists) throw new GraphQLError("Phone not in country")

            const {latitude, longitude, country} = cityExists;

            const {insertedId} = await ctx.RestaurantCollection.insertOne({
                name,
                address,
                phone,
                city,
                country,
                latitude,
                longitude
            });

            return ({
                _id:insertedId,
                name,
                address,
                phone,
                city,
                country,
                latitude,
                longitude
            })
        },

        deleteRestaurant:async(_:unknown, args:{id:string},ctx:Context):Promise<boolean> => {
            const {deletedCount} = await ctx.RestaurantCollection.deleteOne({_id: new ObjectId(args.id)})
            return deletedCount === 1;
        }
    }

}