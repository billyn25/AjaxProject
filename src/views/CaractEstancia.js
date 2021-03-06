import React, {useState, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBuffer} from '@fortawesome/free-brands-svg-icons'
import {faTree, faFire,faDoorOpen,faBuilding,faBorderNone,faTint} from '@fortawesome/free-solid-svg-icons'

function CaractEstancia({caractEstancia, param, back, resumen}) {

    const [position, setPosition] = useState(resumen.position?resumen.position:'')
    const [numHab, setNumHab] = useState(resumen.numHab?resumen.numHab:1)
    const [numEntra, setNumEntra] = useState(resumen.numEntra?resumen.numEntra:1)
    const [numPlantas, setNumPlantas] = useState(resumen.numPlantas?resumen.numPlantas:1)
    const [jardin, setJardin] = useState(resumen.jardin?resumen.jardin:false)
    const [statusButton, setStatusButton] = useState('')
    const [prevencion, setPrevencion] = useState(resumen.prevencion?resumen.prevencion:'No')
    const [prevencionIncendio, setPrevencionIncendio] = useState(resumen.prevencionIncendio?resumen.prevencionIncendio:'No')
    const [toggleImage, setToggleImage] = useState(resumen.toggleImage?resumen.toggleImage:false)

    const [didLoad, setDidLoad] = useState(false);

    useEffect(() => {
        if (!didLoad) {
            window.scrollTo(0, 0);
            setDidLoad(true);
        }
    }, [didLoad]);

    let sendData = () => {

        const objeto = {
            estancia: param,
            position: position,
            numHab: numHab,
            numEntra: numEntra,
            numPlantas: numPlantas,
            jardin: jardin,
            prevencion: prevencion,
            prevencionIncendio : prevencionIncendio,
            toggleImage:toggleImage,
        };
        caractEstancia(objeto)
    }

    useEffect(() => {
        if (param === 'Apartamento/Piso' && position === '') {
            setStatusButton(true)
        } else {
            setStatusButton('')
        }
    })

    return (
        <React.Fragment>
            <div className="title">
                <h4>Características de la estancia</h4>
            </div>
            <div className="estancia">
                <div className="fotoMes text-left w-100 d-flex justify-content-start mb-4">
                    <p className="text-white">Con verificación de imágen</p>
                    <input type="checkbox" checked={toggleImage} className="ml-2 flipswitch" id="customCheck1"
                           onClick={() => setToggleImage(!toggleImage)}/>
                </div>
                <div className="row divDer">
                    {(param !== 'Casa/Chalet' && param !== 'Negocio') && (<div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3" htmlFor="gridRadios1">
                                        Posicion del Apartamento
                                    </label>
                                    <select className="form-control selectPosition" defaultValue={position}
                                            onChange={(e) => setPosition(e.target.value)}>
                                        <option></option>
                                        <option>Bajo o 1º Piso</option>
                                        <option>Ultimo</option>
                                        <option>Otro</option>
                                    </select>
                                </div>
                                <FontAwesomeIcon icon={faBuilding} size="4x"/>
                            </div>
                        </div>
                    </div>)}
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (<div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3" htmlFor="gridRadios2">
                                        Cantidad de plantas
                                    </label>
                                    <input className="form-control textNum" type="number" min="1" defaultValue={numPlantas}
                                           onChange={(e) => setNumPlantas(e.target.value)}/>
                                </div>
                                <FontAwesomeIcon icon={faBuffer} size="4x"/>
                            </div>
                        </div>
                    </div>)}
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3" htmlFor="gridRadios2">
                                        Cantidad de habitaciones incluyendo la cocina
                                    </label>
                                    <input className="form-control textNum" type="number" min="1" value={numHab}
                                           onChange={(e) => setNumHab(e.target.value)}/>
                                </div>
                                <FontAwesomeIcon icon={faBorderNone} size="4x" className="ml-3"/>
                            </div>
                        </div>
                    </div>
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (<div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3" htmlFor="gridRadios2">
                                        Cantidad de entradas
                                    </label>
                                    <input className="form-control textNum" type="number" min="1" value={numEntra}
                                           onChange={(e) => setNumEntra(e.target.value)}/>
                                </div>
                                <FontAwesomeIcon icon={faDoorOpen} size="4x"/>
                            </div>
                        </div>
                    </div>)}
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (
                        <div className="col-sm-4">
                            <div className="card">
                                <div className="card-body rounded">
                                    <div>
                                        <label className="form-check-label mb-3">
                                            Jardín o Zona exterior
                                        </label>
                                        <div>
                                            <input className="form-check-input" type="radio" name="gridRadios"
                                                   defaultChecked={jardin===false} id="gridRadios2"
                                                   onClick={() => setJardin(false)}/>
                                            <label className="small mr-3 form-check-label" htmlFor="gridRadios2">
                                                No hay.
                                            </label>
                                            <input className="form-check-input" type="radio" name="gridRadios"
                                                   id="gridRadios1" defaultChecked={jardin===true}
                                                   onChange={() => setJardin(true)}/>
                                            <label className="small form-check-label" htmlFor="gridRadios1">
                                                Si hay.
                                            </label>
                                        </div>
                                    </div>
                                    <FontAwesomeIcon icon={faTree} size="4x"/>
                                </div>
                            </div>
                        </div>)}
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3">
                                        Prevención contra Inundación
                                    </label>
                                    <div>
                                        <input className="form-check-input" type="radio" name="gridRadiosPre"
                                               id="gridRadios3" defaultChecked={prevencion==='No'}
                                               onClick={() => setPrevencion('No')}/>
                                        <label className="mr-3 small form-check-label" htmlFor="gridRadios3">
                                            No.
                                        </label>
                                        <input className="form-check-input" type="radio" name="gridRadiosPre"
                                               id="gridRadios4" defaultChecked={prevencion==='Si'}
                                               onClick={() => setPrevencion('Si')}/>
                                        <label className="small form-check-label" htmlFor="gridRadios4">
                                            Si.
                                        </label>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faTint} size="4x"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3">
                                        Prevención contra Incendio
                                    </label>
                                    <div>
                                        <input className="form-check-input" type="radio" name="gridRadiosPreInc"
                                               id="gridRadios5" checked={prevencionIncendio==='No'}
                                               onClick={() => setPrevencionIncendio('No')}/>
                                        <label className="mr-3 small form-check-label" htmlFor="gridRadios5">
                                            No.
                                        </label>
                                        <input className="form-check-input" type="radio" name="gridRadiosPreInc"
                                               id="gridRadios6" checked={prevencionIncendio==='Incendio'}
                                               onClick={() => setPrevencionIncendio('Incendio')}/>
                                        <label className="ml-2 mr-1 small form-check-label" htmlFor="gridRadios6">
                                            Incendio.
                                        </label>
                                        <input className="form-check-input" type="radio" name="gridRadiosPreInc"
                                               id="gridRadios7" checked={prevencionIncendio==='Incendio y CO'}
                                               onClick={() => setPrevencionIncendio('Incendio y CO')}/>
                                        <label className="ml-2 small form-check-label" htmlFor="gridRadios7">
                                            Incendio y CO.
                                        </label>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faFire} size="4x"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="divIzq">
                    <h5 className="text-white text-left">Estancia: <span className="verdeAj">{param}</span></h5>
                    {(param !== 'Casa/Chalet' && param !== 'Negocio') && (
                        <h5 className="text-white text-left">Posición Apartamento: <span
                            className="verdeAj">{position}</span></h5>)}
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (
                        <h5 className="text-white text-left">Plantas: <span className="verdeAj">{numPlantas}</span>
                        </h5>)}
                    <h5 className="text-white text-left">Habitaciones: <span className="verdeAj">{numHab}</span>
                    </h5>
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (
                        <h5 className="text-white">Entradas: <span className="verdeAj">{numEntra}</span>
                        </h5>)}
                    {(param === 'Casa/Chalet' || param === 'Negocio') && (
                        <h5 className="text-white text-left">Jardin o Zona exterior: <span
                            className="verdeAj">{jardin ? 'Si' : 'No'}</span></h5>)}
                    <h5 className="text-white text-left">Prevención Inundación:<span className="verdeAj"> {prevencion}</span></h5>
                    <h5 className="text-white text-left">Prevención Incendio:<span className="verdeAj"> {prevencionIncendio}</span></h5>
                </div>
                <div className="buttonBottom">
                    <button onClick={() => back(param)} type="button" className="btn btn-outline-light">Atras</button>
                    <button onClick={() => sendData()} type="button" className="ml-4 btn btn-outline-success"
                            disabled={statusButton}>Siguiente
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

export default CaractEstancia;
