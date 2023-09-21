import React, { useCallback, useEffect, useState } from 'react'
import Constants from 'expo-constants'
import { Image, Text, View, TextInput, SafeAreaView, ImageBackground, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, ScrollViewBase, ScrollViewComponent} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import {debounce} from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather'
import { WeatherImages, bgApp } from '../constants/constants'
import { getData, storeData } from '../utils/asyncStorage'
import { BlurView } from 'expo-blur';

const Home = () => {

  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState({})
  const [loading, setLoading] = useState(true)


  const handleLocation = (loc) => {
    console.log('location: ', loc);
    setLocations([]);
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days:'7'
    }).then(data => {
      setWeather(data)
      setLoading(false)
      storeData('city', loc.name)
    })
  }
  
  const handleSearch = (value) => {
    if(value.length > 2){
      fetchLocations({cityName: value}).then(data => {
        setLocations(data)
      })

    }
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 100), [])

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Mar Del Plata'
    if(myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: '7',
    }).then(data => {
      setWeather(data)
      setLoading(false)
    })
  }


  useEffect(() => {
    fetchMyWeatherData()
  }, [])


  const {current, location} = weather;


  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={bgApp[current?.condition?.text]}
        style={styles.bgAppimg}
      >
        {/* Fondo semitransparente */}
        <View style={styles.overlay} />

        <View style={{ flex: 1 }}>
          <StatusBar style='dark' />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff00" />
            </View>
          ) : (
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView>
                <View style={styles.container}>
                  {/* Contenido principal */}
                  <View style={styles.containerInput}>
                    <TextInput style={styles.input} placeholder='Search city' placeholderTextColor={'white'} onChangeText={handleTextDebounce} />
                    <TouchableOpacity style={styles.btnInput}>
                      <MagnifyingGlassIcon size="20" color="gray" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.xd}>
                    <View style={styles.containerSearch}>
                      {locations.map((loc, index) => (
                        <TouchableOpacity key={index} style={styles.searchFind} onPress={() => handleLocation(loc)}>
                          <MapPinIcon size='20' color='gray' />
                          <Text style={{ marginLeft: 5 }}>{loc?.name}, {loc?.country}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Sección de pronóstico actual */}
                <View style={styles.sectionLocation}>
                  <View style={styles.containerBlur}>
                    <BlurView style={styles.blur} intensity={50} />
                  </View>
                  <Text style={{ color: 'white', fontWeight: 700, fontSize: 30 }}>
                    {location?.name}
                  </Text>
                  <Text style={{ color: 'white', fontWeight: 100, fontSize: 24 }}>
                    {location?.country}
                  </Text>
                  {/* Imagen del clima */}
                  <View>
                    <Image source={WeatherImages[current?.condition?.text]} style={{ marginTop: '10%', width: 200, height: 200 }} />
                  </View>
                  <View style={{ marginTop: '10%', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 50, textAlign: 'center' }}>
                      {current?.temp_c}°
                    </Text>
                    <Text style={{ color: 'white', fontSize: 25, fontWeight: 200 }}>
                      {current?.condition?.text}
                    </Text>
                  </View>
                </View>

                {/* Estadísticas */}
                <View style={styles.stats}>
                  <View style={styles.containerBlur}>
                    <BlurView style={styles.blur} intensity={50} />
                  </View>
                  <View style={styles.statsProps}>
                    <Image source={require('../../assets/wind.png')} style={{ width: 30, height: 30 }} />
                    <Text style={{ color: 'lightgrey', marginLeft: 5 }}>{current?.wind_kph}km</Text>
                  </View>
                  <View style={styles.statsProps}>
                    <Image source={require('../../assets/drop.png')} />
                    <Text style={{ color: 'lightgrey', marginLeft: 5 }}>{current?.humidity}%</Text>
                  </View>
                  <View style={styles.statsProps}>
                    <Image source={require('../../assets/sun.png')} />
                    <Text style={{ color: 'lightgrey', marginLeft: 5 }}>{location.localtime.slice([-4])}</Text>
                  </View>
                </View>

                {/* Pronóstico para los próximos 7 días */}
                <View style={styles.forecastSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CalendarDaysIcon size='22' color='white' />
                    <Text style={{ color: 'white', marginLeft: 5 }}>Daily forecast</Text>
                  </View>
                  <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 15 }} showsHorizontalScrollIndicator={false}>
                    {weather?.forecast?.forecastday?.map((item, index) => {
                      let date = new Date(item.date);
                      let options = { weekday: 'long' }
                      let dayName = date.toLocaleDateString('en-US', options)
                      dayName = dayName.split(',')[0]
                      return (
                        <View key={index} style={styles.bgImageForecast}>
                          <View style={styles.containerBlur}>
                            <BlurView style={styles.blur} intensity={50} />
                          </View>
                          <Image source={WeatherImages[item?.day?.condition?.text]} />
                          <Text style={{ textAlign: 'center', color: 'white' }}>{dayName}</Text>
                          <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>{item?.day?.avgtemp_c}°</Text>
                        </View>
                      )
                    })}
                  </ScrollView>
                </View>
              </ScrollView>
            </SafeAreaView>
          )}
        </View>
      </ImageBackground>
    </View>
   
  )
}

export default Home

const styles = StyleSheet.create({
  containerInput:{
    backgroundColor: '#fff',
    opacity:0.5, 
    height:40, 
    width:'80%', 
    alignSelf:'center',
    borderRadius:20,
    marginTop: '10%',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between'
  },

  btnInput:{
    marginRight:'2%',
    borderRadius:100,
    backgroundColor:'white',
    padding:5
  },

  input:{
    padding:10,
  },

  searchFind:{
    backgroundColor:'white',
    padding:10,
    borderBottomWidth:1,
    borderBottomColor:'lightgray',
    borderRadius:10,
    flexDirection:'row',
  
  },
  
  containerSearch:{
    width:'90%',
    borderRadius:20,
    alignSelf:'center',
  },
  
  xd:{
    marginTop:'2%',
    width:'80%',
    backgroundColor:'white',
    alignSelf:'center',
    borderRadius:20
  },

  sectionLocation:{
    alignItems:'center',
    flexDirection:'column',
    marginTop: '15%',
    width:'80%',
    alignSelf:'center',
    padding:10
    
  },

  stats:{
    flexDirection:'row',
    justifyContent:'space-around',
    marginTop:'15%',
    width:'80%',
    alignSelf:'center',
    padding:5
  },

  statsProps:{
    flexDirection:'row',
    alignItems:'center',
  },

  forecastSection:{
    marginLeft:'8%',
    marginTop:50,
    marginBottom:20
  },
  bgImageForecast:{
    paddingLeft:20,
    paddingRight:20,
    paddingTop:10,
    paddingBottom:10,
    marginTop: 15,
    margin:5

  },

  bgAppimg:{
    height:'100%',
  },

  bgAppimg: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ajusta el nivel de opacidad según lo necesites
  },

  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },


  blur: {
    flex:1
  },

  containerBlur:{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30, // Ajusta el valor de borderRadius según tus preferencias
    overflow: 'hidden', // Esto es importante para que el borderRadius funcione
  }



})