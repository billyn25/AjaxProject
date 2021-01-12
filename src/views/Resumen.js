import React, {useState, useEffect, useContext} from 'react';
import {AjaxkitBasic} from '../data/dataJson'
import {MyContext} from "../context.js";
import ResumenData from "./ResumenData";
import LoadingSpinner from "./LoadingSpinner";
import html2pdf from 'html2pdf.js'
import hp from '../img/hp.png'

function Resumen({datos, reset}) {

    const {dispatch, state} = useContext(MyContext);
    const {data} = state;

    const {numEntra, numHab, estancia, position, numPlantas, jardin, prevencion, prevencionIncendio} = datos
    const [toggle, setToggle] = useState(false)
    const [loading, setLoad] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [discountLineal, setDiscountLineal] = useState(false);
    const [tokenDisableButton, setTokenDisableButton] = useState(false);

    useEffect(() => {
            setLoad(true);
            setLoadingMessage('Configurando Panel de Ajax')
            setTimeout(() => {
                setLoad(false)
                datafilterPiso()
            }, 1200);
        },
        [],
    );

    //calcular indices auto
    let calcIndex = (arr, text) => {
        return arr.findIndex(function (item, i) {
            return item.title === text
        });
    }

    //filter for initial kit basic
    let datafilterPiso = (i,v) => {

        // si esta vacio es por que hemos saltado asistente
        if (datos !== 'vacio') {

            let filtered = JSON.parse(JSON.stringify(AjaxkitBasic))

            if(datos.toggleImage!==true) {
                filtered = (filtered).filter(({status}) => status === 'initial');
            } else {
                filtered = (filtered).filter(({cam}) => cam === 'si');
                setToggle(true)
            }

            switch (estancia) {
                case 'Apartamento/Piso':

                    if (position === 'Bajo o 1º Piso' || position === 'Ultimo')
                        filtered[calcIndex(filtered, 'DoorProtect')].amount = parseInt(numHab) + 1;

                    filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'HomeSiren')]
                    break;
                case 'Casa/Chalet':
                case 'Negocio':
                    console.log(numPlantas)

                    //change numHab h1
                    if(datos.toggleImage!==true) {
                        filtered[calcIndex(filtered, 'MotionProtect')].amount = parseInt(numPlantas)
                    } else {
                        //change numHab h2
                        filtered[calcIndex(filtered, 'MotionCam')].amount = parseInt(numPlantas)
                    }

                    filtered[calcIndex(filtered, 'DoorProtect')].amount = parseInt(numEntra) + parseInt(numHab);
                    filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'StreetSiren')]

                    if (numPlantas >= 3)
                        filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'ReX')]

                    if (jardin === true)
                        filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'MotionProtect Outdoor')]

                    if (estancia === 'Negocio') {
                        filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'KeyPad')]
                        filtered[(calcIndex(filtered, 'KeyPad'))].amount = numEntra
                    }
                    break;
                default:
            }

            //prevenciones
            switch (prevencion) {
                case 'Si':
                    filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'LeaksProtect')]
                    break;
                default:
            }

            //prevencion incendio
            switch (prevencionIncendio) {
                case 'Incendio':
                    filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'FireProtect')]
                    break;
                case 'Incendio y CO':
                    filtered[Object.keys(filtered).length] = AjaxkitBasic[calcIndex(AjaxkitBasic, 'FireProtect Plus')]
                    break;
                default:
            }
            //set new data
            dispatch({type: "ADD", payload: filtered});
        }
    }

    let toggleF = (i) => {
        //seleccion de hub si necesita motion cam
        setToggle(i)

        if (toggle === true) {
            ChangeKit('1')
        } else {
            ChangeKit('2')
        }
    }

    let ChangeKit = (hub) => {

        let newAarryEdit = [...data]
        let originalArray = JSON.parse(JSON.stringify(AjaxkitBasic));

        if (hub === '2') {

            if (calcIndex(newAarryEdit, 'Hub 2') === -1) // si no existe hub 2
                newAarryEdit[calcIndex(newAarryEdit, 'Hub 1') !== -1 ? calcIndex(newAarryEdit, 'Hub 1') : Object.keys(newAarryEdit).length] = originalArray[calcIndex(originalArray, 'Hub 2')]

            if (calcIndex(newAarryEdit, 'MotionCam') === -1) {
                newAarryEdit[calcIndex(newAarryEdit, 'MotionProtect') !== -1 ? calcIndex(newAarryEdit, 'MotionProtect') : Object.keys(newAarryEdit).length] = originalArray[calcIndex(originalArray, 'MotionCam')]
            }

            //igualar cantidad
            newAarryEdit[calcIndex(newAarryEdit, 'Hub 2')].amount = data[calcIndex(data, 'Hub 1')] ? data[calcIndex(data, 'Hub 1')].amount : 1
            newAarryEdit[calcIndex(newAarryEdit, 'MotionCam')].amount = data[calcIndex(data, 'MotionProtect')] ? data[calcIndex(data, 'MotionProtect')].amount : 1

            dispatch({type: "ADD", payload: newAarryEdit});

        } else {

            if (calcIndex(newAarryEdit, 'Hub 1') === -1)
                newAarryEdit[calcIndex(newAarryEdit, 'Hub 2') !== -1 ? calcIndex(newAarryEdit, 'Hub 2') : Object.keys(newAarryEdit).length] = originalArray[calcIndex(originalArray, 'Hub 1')]

            if (calcIndex(newAarryEdit, 'MotionProtect') === -1) {
                newAarryEdit[calcIndex(newAarryEdit, 'MotionCam') !== -1 ? calcIndex(newAarryEdit, 'MotionCam') : Object.keys(newAarryEdit).length] = originalArray[calcIndex(originalArray, 'MotionProtect')]
            } else {
                newAarryEdit = newAarryEdit.filter(
                    (key, index) => index !== calcIndex(newAarryEdit, 'MotionCam')
                );
            }
            //igualar cantidades
            newAarryEdit[calcIndex(newAarryEdit, 'Hub 1')].amount = data[calcIndex(data, 'Hub 2')] ? data[calcIndex(data, 'Hub 2')].amount : 1
            newAarryEdit[calcIndex(newAarryEdit, 'MotionProtect')].amount = data[calcIndex(data, 'MotionCam')] ? data[calcIndex(data, 'MotionCam')].amount : 1

            dispatch({type: "ADD", payload: newAarryEdit});
        }
    }

    //suma del total
    let sum = (d) => {

        var total = 0;
        for (var i = 0; i < d.length; i++) {
            total += data[i].discount ? ((data[i].price * ((100 - data[i].discount) / 100)) * data[i].amount) : data[i].price * data[i].amount;
        }

        if (!discountLineal) {
            return total.toFixed(2)
        } else {
            return (total * ((100 - parseInt(discountLineal)) / 100)).toFixed(2)
        }
    }

    //abrir menu lateral
    let openNav = () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.getElementById("mySidenav").style.width = window.screen.width + 'px';
        } else {
            document.getElementById("mySidenav").style.width = "460px"
            document.getElementById("App").style.marginLeft = "460px";
        }
    }

    //borrar datos de la tabla
    let deleteData = () => {
        let arrayEdit = [];
        dispatch({type: "ADD", payload: arrayEdit});
        document.getElementById("form").reset();

        setToggle(false)
    }

    //change size table for export pdf
    let pdfExport = () => {

        //eliminar del pdf los botones
        setTokenDisableButton(true)
        setTimeout(() => {
            setTokenDisableButton(false)
            setLoad(true)
            setLoadingMessage('Exportando pdf')
        }, 0);

        const element = document.getElementById("divTable");
        var opt = {
            pagebreak: {avoid: 'tr'},
            margin: [0,5,0,0],
            filename: 'AjaxConfig.pdf',
            image: {type: 'png', quality: 1},
            html2canvas: {scrollX: 0, scrollY: 0, dpi: 192, letterRendering: true, useCORS: true},
            jsPDF: {unit: 'pt', format: 'a4', orientation: 'p'}
        };

        html2pdf(element, opt).then(function () {
            setLoad(false)
        });

    }

    return (
        <React.Fragment>
            <div className="title">
                <h4>Resumen</h4>
            </div>
            {loading ? <LoadingSpinner message={loadingMessage}/> : (
                <div className="estancia">
                    <div className="buttons pl-0 pb-2 custom-control custom-checkbox justify-content-between">
                        <div className="d-inline-flex align-items-end text-white">
                            <p>Foto</p>
                            <input type="checkbox" checked={toggle} className="ml-2 flipswitch" id="customCheck1"
                                   onClick={() => toggleF(!toggle)}/>
                            <p className="ml-4 text-white">% Lineal</p>
                            <input className="discountLineal ml-2 form-control textNum"
                                   onChange={(e) => setDiscountLineal(e.target.value)} type="number" min="0" max="100"/>
                        </div>
                        <div id="buttonDiv" className="buttonsDivs">
                            <button onClick={() => openNav()} type="button"
                                    className="btn btn-sm btn-outline-success mr-2">Añadir
                            </button>
                            <button onClick={() => deleteData()} type="button"
                                    className="btn btn-sm btn-outline-warning mr-2">Limpiar
                            </button>
                            <button onClick={() => pdfExport()} type="button" disabled={Object.keys(data).length < 1}
                                    className="btn btn-sm btn-outline-secondary mr-2">Exportar pdf
                            </button>
                            <button onClick={() => {
                                deleteData();
                                reset()
                            }} type="button" className="btn btn-sm btn-outline-danger">Reiniciar
                            </button>
                        </div>
                    </div>
                    <hr className="bg-white mb-2 mt-0"/>
                    <div className="table-responsive-sm" id='divTable'>
                        <form id="form" className="pt-4 pb-4 row g-3 justify-content-between align-items-center">
                            <div className="ml-3 mr-4">
                                <img id="imgHiperId" className="imgHiper" src={hp}/>
                            </div>
                            <div className="col-md-3">
                                <input type="text" className="inputCustomer form-control" id="inputName"
                                       aria-label="Small" aria-describedby="inputGroup-sizing-sm" placeholder="Cliente/Empresa"/>
                            </div>
                            <div className="col-md-2">
                                <input type="number" className="inputCustomer form-control" id="inputMovil"
                                       aria-label="Small" aria-describedby="inputGroup-sizing-sm" placeholder="Móvil"/>
                            </div>
                            <div className="col-md-4">
                                <input type="email" className="inputCustomer form-control" id="inputEmail"
                                       aria-label="Small" aria-describedby="inputGroup-sizing-sm" placeholder="Em@il"/>
                            </div>
                        </form>
                        <table id="table-to-xls" className="table border mb-5">
                            <thead>
                            <tr className="verdeAj">
                                <th scope="col" className="text-center">Imagen</th>
                                <th scope="col" className="text-center">Descripcion</th>
                                <th scope="col" className="text-center">Cantidad</th>
                                <th scope="col" className="text-center">P.V.P</th>
                                <th scope="col" className="">Descuento</th>
                                <th scope="col" className="text-center">Total</th>
                                <th scope="col" className="text-center"></th>
                            </tr>
                            </thead>
                            {Object.keys(data).length < 1 && (<tbody>
                            <tr className="bg-transparent">
                                <td colSpan="7">
                                    <p className="text-white text-center mt-4">No hay productos seleccionados</p>
                                </td>
                            </tr>
                            </tbody>)}
                            {Object.keys(data).length >= 1 && (<tbody>
                                {Object.keys(data).map((key, index) => (
                                    <ResumenData data={data[key]} index={index} key={key} token={tokenDisableButton}
                                                 discountLineal={discountLineal}/>))}
                                <tr className="bg-white border-left">
                                    <td colSpan="2">
                                        {discountLineal && (
                                            <p className="text-dark pl-3">Oferta con descuento aplicado.</p>)}
                                    </td>
                                    <td colSpan="2" className="text-right border-left"><p
                                        className="iva">Total {sum(data)}</p></td>
                                    <td colSpan="3" className="border-left pl-0 pt-3 pb-3 pr-4 text-right">
                                        <h5 className="text-dark total font-weight-bold">Total {(sum(data) * 1.21).toFixed(2)} €</h5>
                                        <p className="float-right">I.V.A incluido.</p>
                                    </td>
                                </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}

export default Resumen;
