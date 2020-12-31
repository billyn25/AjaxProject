import React, {useState, useReducer} from 'react';
import './App.css';
import Estancia from "./views/Estancia";
import CaractEstancia from "./views/CaractEstancia";
import Resumen from "./views/Resumen";
import {initialState, reducer} from "./reducers.js";
import {MyContext} from "./context.js";
import MenuProducts from "./views/MenuProducts";

function App() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const [estancia, setEstancia] = useState('')
    const [caractEstancia, setCaractEstancia] = useState('')
    const [resumen, setResumen] = useState('')
    const [memoryData, setMemoryData] = useState('')

    let estanciaFun = (d) => {
        setEstancia(d)
    }

    let caracEstanciaFun = (d) => {
        setCaractEstancia(d)
        setResumen(d)
    }

    let reset = () => {
        setEstancia('')
        setResumen('')
        setCaractEstancia('')
        setMemoryData('')

        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("App").style.marginLeft = "0";
    }

    //esta funcion es para cuando vuelves atras guardar la estancia en memoria
    let back = (d) => {

        setEstancia('')
        setMemoryData(d)
    }

    let saltarAsistente = () => {

        setEstancia('vacio')
        setCaractEstancia('vacio')
        setResumen('vacio')
        let arrayEdit = [];
        dispatch({type: "ADD", payload: arrayEdit});
    }

    return (
        <MyContext.Provider value={{state, dispatch}}>
            <div id="App">
                <header className="App-header">
                    <a href="#"><img
                        src="https://i2.wp.com/stemar.co.za/wp-content/uploads/2020/05/Ajax-Logo-White.png?fit=1024%2C410&ssl=1"
                        className="App-logo" alt="logo"/></a>
                    <h5 className="text-white">Panel Configurador</h5>
                </header>
                <ul className="statusBar">
                    <li className={estancia ? "verdeAj" : "text-white"}>1. Estancia</li>
                    <li className={estancia && caractEstancia ? "verdeAj" : "text-white"}>2. Características de la
                        estancia
                    </li>
                    <li className="text-white">3. Resumen</li>
                </ul>
                {!estancia && (
                    <Estancia estancia={estanciaFun} backMemory={memoryData} saltarAsistente={saltarAsistente}/>)}
                {(estancia && resumen === '') && (
                    <CaractEstancia caractEstancia={caracEstanciaFun} param={estancia} back={back}/>)}
                {caractEstancia && (<Resumen datos={resumen} reset={reset}/>)}
            </div>
            <MenuProducts/>
        </MyContext.Provider>
    );
}

export default App;
