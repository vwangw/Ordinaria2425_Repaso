import { OptionalId } from "mongodb";

export type RestaurantModel = OptionalId<{
    name:string,
    address:string,
    city:string,
    country:string,
    phone:string,
    latitude:string,
    longitude:string
}>

export type CountryAPI = Array<{name:string}>

export type CityAPI = Array<{
    latitude:string,
    longitude:string,
    country:string
}>

export type WorldTimeAPI = {
    hour:string,
    minute:string
}

export type PhoneAPI = {
    is_valid:boolean,
    country:string
}

export type WeatherAPI = {
    temp:number
}