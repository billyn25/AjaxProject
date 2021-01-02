import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faBuilding} from '@fortawesome/free-solid-svg-icons'
import {faHome} from '@fortawesome/free-solid-svg-icons'
import {faBriefcase} from '@fortawesome/free-solid-svg-icons'

function Estancia({estancia,backMemory,saltarAsistente}) {

    const [dato, setDato] = useState(backMemory)

    let selectionEstancia  = (d) =>{
        estancia(d)
        setDato(d)
    }

    return (
        <React.Fragment>
        <h4 className="mt-1 mb-4 text-white">Elige la estancia</h4>
            <div className="estancia">
                <div className="row divDer">
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <input className="form-check-input" type="radio" defaultChecked={backMemory==="Apartamento/Piso"} name="gridRadios" id="gridRadios1"
                                       onChange={() => setDato("Apartamento/Piso")}/>
                                <label className="form-check-label" htmlFor="gridRadios1">
                                    Apartamento/Piso
                                </label>
                                <FontAwesomeIcon icon={faBuilding} size="4x"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <input className="form-check-input" type="radio" name="gridRadios" defaultChecked={backMemory==="Casa/Chalet"} id="gridRadios2"
                                       onChange={() => setDato("Casa/Chalet")}/>
                                <label className="form-check-label" htmlFor="gridRadios2">
                                    Casa/Chalet
                                </label>
                                <FontAwesomeIcon icon={faHome} size="4x"/>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="card">
                            <div className="card-body rounded">
                                <input className="form-check-input" type="radio" name="gridRadios" defaultChecked={backMemory==="Negocio"} id="gridRadios3"
                                       onChange={() => setDato("Negocio")}/>
                                <label className="form-check-label" htmlFor="gridRadios3">
                                    Negocio
                                </label>
                                <FontAwesomeIcon icon={faBriefcase} size="4x"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="divIzq">
                   <h5 className="text-white">Estancia: <span className="verdeAj">{dato}</span></h5>
                </div>
                <div className="buttonBottom">
                    <button onClick={()=>saltarAsistente()}  type="button" className="mb-2 mr-4 btn btn-outline-warning">Saltar asistente</button>
                    <button onClick={()=>selectionEstancia(dato)} disabled={Object.keys(dato).length <1} type="button" className="mb-2 btn btn-outline-success">Siguiente</button>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Estancia;
