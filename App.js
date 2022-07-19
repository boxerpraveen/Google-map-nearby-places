import {
  Button,
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import axios from "axios";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const homePlace = {
  description: "Home",
  geometry: { location: { lat: 48.8152937, lng: 2.4597668 } },
};
const workPlace = {
  description: "Work",
  geometry: { location: { lat: 48.8496818, lng: 2.2940881 } },
};

const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [addressData, setAddressData] = useState("My Address");
  const [nearByData, setNearByData] = useState([]);
  const [filteredAddress, setFilteredAddress] = useState("");
  const [inputHandler, setInputHandler] = useState("");
  const [inputAddress, setInputAddress] = useState("");

  useEffect(() => {
    async function getPermission() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
    }
    getPermission();
  }, []);

  async function myLocation() {
    let location = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  }

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const myApiKey = "AIzaSyB0slSsPeNEzDi1lRieccj6GPhEDQxBPIY";

  function getAddressFromCoordinates(latitude, longitude) {
    return new Promise((resolve, reject) => {
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${latitude},${longitude}&key=${myApiKey}`
      )
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.status === "OK") {
            resolve(responseJson?.results?.[0]?.formatted_address);
            setAddressData(responseJson?.results?.[0]?.formatted_address);
          } else {
            reject("not found");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  const RADIUS_AROUND_US = 1500; //  1500 * 1000 = 1.5 KM
  const nearBy = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=foodbeez&location=9.92251496041773,78.09504624902165&radius=1500&key=AIzaSyB0slSsPeNEzDi1lRieccj6GPhEDQxBPIY`;
  useEffect(() => {
    var config = {
      method: "get",
      url: nearBy,

      headers: {
        type: "json",
      },
    };

    axios(config)
      .then(function (response) {
        // setNearByData(response.data.predictions);
        // console.log(response.data.results, "Map Data");
        // setNearByData(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, []);

  function listedAddress({ item }) {
    if (!item) {
      return <Text>Hi</Text>;
    }
    return (
      <Text
        style={styles.listedItem}
        onPress={() => {
          setInputAddress(item.description);
        }}
      >
        {item.description}
      </Text>
    );
  }

  function onChangeAddressHanlder(enteredAddress) {
    const nearBy = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${enteredAddress}&location=9.92247028421007,78.09488433482326&radius=1500&strictbounds=true&key=AIzaSyB0slSsPeNEzDi1lRieccj6GPhEDQxBPIY`;

    var config = {
      method: "get",
      url: nearBy,

      headers: {
        type: "json",
      },
    };
    const fetchData = axios(config)
      .then((response) => {
        setNearByData(response.data.predictions);
        // console.log(response.data.results, "Map Data");
        // setNearByData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

    setFilteredAddress(enteredAddress);
    setInputAddress(enteredAddress);
  }

  const filteredAddressData = nearByData.filter((data) => {
    if (filteredAddress.trim() === "") {
      return false;
    }
    return data.description
      .toLowerCase()
      .includes(filteredAddress.toLowerCase());
  });

  return (
    <>
      <View style={styles.container}>
        <Text>My Location App</Text>
        <Button title="My Coords" onPress={myLocation} />
        <Text>{text}</Text>
        <Button
          title="My location"
          onPress={() =>
            getAddressFromCoordinates(location.latitude, location.longitude)
          }
        />
        <Text>{addressData}</Text>
        <View style={styles.dropdownContainer}>
          <TextInput
            style={styles.input}
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={onChangeAddressHanlder}
            value={inputAddress}
          />
          <FlatList
            data={filteredAddressData}
            keyExtractor={(arr) => arr.place_id}
            renderItem={listedAddress}
            style={{ height: 100 }}
          />
        </View>
      </View>
    </>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    margin: 10,
    marginTop: 60,
  },
  dropdownContainer: {
    marginTop: 25,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#a36",
    paddingVertical: 5,
    paddingLeft: 8,
    fontSize: 18,
    color: "#717171",
    paddingRight: 4,
    backgroundColor: "#fff",
  },
  listedItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    padding: 8,
  },

  // listItem: {
  //   width: 6,
  //   height: 6,
  //   borderRadius: 50,
  //   backgroundColor: "#f33",
  //   marginRight: 8,
  //   fontSize: 18,
  // },
  listedText: {
    fontSize: 18,
  },
});
