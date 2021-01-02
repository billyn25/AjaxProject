import React, {useState, useEffect} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBuffer} from '@fortawesome/free-brands-svg-icons'
import {faTree, faFire,faDoorOpen,faBuilding,faBorderNone} from '@fortawesome/free-solid-svg-icons'

function CaractEstancia({caractEstancia, param, back}) {

    const [position, setPosition] = useState('')
    const [numHab, setNumHab] = useState(1)
    const [numEntra, setNumEntra] = useState(1)
    const [numPlantas, setNumPlantas] = useState(1)
    const [jardin, setJardin] = useState('')
    const [statusButton, setStatusButton] = useState('')
    const [prevencion, setPrevencion] = useState('Nada')

    let sendData = () => {

        const objeto = {
            estancia: param,
            position: position,
            numHab: numHab,
            numEntra: numEntra,
            numPlantas: numPlantas,
            jardin: jardin,
            prevencion: prevencion
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
            <h4 className="mt-1 mb-4 text-white">Características de la estancia</h4>
            <div className="estancia">
                <div className="row divDer">
                    {(param !== 'Casa/Chalet' && param !== 'Negocio') && (<div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <div>
                                    <label className="form-check-label mb-3" htmlFor="gridRadios1">
                                        Posicion del Apartamento
                                    </label>
                                    <select className="form-control selectPosition"
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
                                    <input className="form-control textNum" type="number" min="1" value={numPlantas}
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
                                                   id="gridRadios1"
                                                   onChange={() => setJardin(true)}/>
                                            <label className="mr-3 small form-check-label" htmlFor="gridRadios1">
                                                Si tengo.
                                            </label>
                                            <input className="form-check-input" type="radio" name="gridRadios"
                                                   defaultChecked id="gridRadios2"
                                                   onClick={() => setJardin(false)}/>
                                            <label className="small form-check-label" htmlFor="gridRadios2">
                                                No tengo.
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
                                        Prevención contra:
                                    </label>
                                    <div>
                                        <input className="form-check-input" type="radio" name="gridRadiosPre"
                                               id="gridRadios3" defaultChecked
                                               onChange={() => setPrevencion('nada')}/>
                                        <label className="mr-3 small form-check-label" htmlFor="gridRadios3">
                                            Nada.
                                        </label>
                                        <input className="form-check-input" type="radio" name="gridRadiosPre"
                                               id="gridRadios4"
                                               onClick={() => setPrevencion('Inundaciones')}/>
                                        <label className="small form-check-label" htmlFor="gridRadios4">
                                            Inundaciones.
                                        </label>
                                        <input className="form-check-input" type="radio" name="gridRadiosPre"
                                               id="gridRadios5"
                                               onClick={() => setPrevencion('Incendios')}/>
                                        <label className="small form-check-label" htmlFor="gridRadios5">
                                            Incendios.
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
                    <h5 className="text-white text-left">Prevención contra: <span className="verdeAj">{prevencion}</span>
                    </h5>
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
