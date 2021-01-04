import React, {useContext, useState} from 'react';
import {MyContext} from "../context";
import {AjaxkitBasic} from '../data/dataJson'

function MenuProducts() {

    const {dispatch, state} = useContext(MyContext);
    const {data} = state
    const [statusAlert, setStatusAlert] = useState(true)
    const [productName, setProductName] = useState(true)
    const [toggle, setToggle] = useState(false)
    const [toggleAjax, setToggleAjax] = useState(true)

    //calcular indices auto
    let calcIndex = (arr, text) => {
        return arr.findIndex(function (item, i) {
            return item.title === text
        });
    }

    let arrayFiltered = JSON.parse(JSON.stringify(AjaxkitBasic))

    if (toggleAjax)
        if (toggle === true) {
            arrayFiltered = (arrayFiltered).filter(({color}) => color === 'black');
        } else {
            arrayFiltered = (arrayFiltered).filter(({color}) => color !== 'black');
        }

    let checkIfExist = (i) => {

        setProductName(i)

        if (calcIndex(data, i) !== -1) {

            setStatusAlert(false)
            dispatch({type: "INCREMENT_AMOUNT", payload: calcIndex(data, i)})
            setTimeout(() => {
                setStatusAlert(true)
            }, 1300);
        } else {

            setStatusAlert(false)

            dispatch({type: "ADD_ITEM", payload: arrayFiltered[calcIndex(arrayFiltered, i)]})
            setTimeout(() => {
                setStatusAlert(true)
            }, 1300);
        }
    }

    /* Set the width of the side navigation to 0 */
    let closeNav = () => {
        document.getElementById("mySidenav").style.width = "0";
        document.getElementById("App").style.marginLeft = "0";
    }

    let toggleF = (i) => {
        //cambiar color
        setToggle(i)
    }

    return (
        <div id="mySidenav" className="sidenav">
            <div className="alert alert-success text-center" role="alert" hidden={statusAlert}>
                <p className="font-weight-bold">{productName} Añadido</p>
            </div>
            <hr className="bg-white m-0 p-0"/>
            <ul className="productsBar m-0">
                <div>
                    {toggleAjax===true && (<input type="checkbox" checked={toggle} className="flipswitch bandwbut" id="customCheck1"
                           onChange={() => toggleF(!toggle)}/>)}
                    <li className="closebtn"><span className="pl-2 pr-2" onClick={() => closeNav()}>&times;</span></li>
                </div>
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <label className="btn btn-outline-success">
                        <input type="radio" onClick={()=>setToggleAjax(true)} checked={toggleAjax} name="options" id="option2" autoComplete="off"/>Ajax
                    </label>
                    <label className="btn btn-outline-secondary">
                        <input type="radio" onClick={()=>setToggleAjax(false)} name="options" id="option3" autoComplete="off"/> Otros
                    </label>
                </div>
            </ul>
            {toggleAjax && (
                <React.Fragment>
                    <ul className="productsBar m-0 pt-0 pb-0">
                        {Object.keys(arrayFiltered).map((key, index) => {
                                return arrayFiltered[key].cat === 'kit' ?
                                    <li className="menuImg" tabIndex="0" data-bs-toggle="tooltip"
                                        title={arrayFiltered[key].description}
                                        key={key} onClick={() => checkIfExist(arrayFiltered[key].title)}>
                                        <img alt={arrayFiltered[key].filename} className="m-2"
                                             src={arrayFiltered[key].filename}
                                             width='40' height='40'/>
                                        <p>{arrayFiltered[key].title}</p>
                                    </li> : null
                            }
                        )}
                    </ul>
                    <ul className="productsBar m-0">
                        {Object.keys(arrayFiltered).map((key, index) => {
                                return (arrayFiltered[key].cat !== 'kit' && arrayFiltered[key].cat !== 'otros') ?
                                    <li className="menuImg" tabIndex="0" data-bs-toggle="tooltip"
                                        title={arrayFiltered[key].description}
                                        key={key} onClick={() => checkIfExist(arrayFiltered[key].title)}>
                                        <img alt={arrayFiltered[key].filename} className="m-2"
                                             src={arrayFiltered[key].filename}
                                             width='40' height='40'/>
                                        <p>{arrayFiltered[key].title}</p>
                                    </li> : null
                            }
                        )}
                    </ul>
                </React.Fragment>
            )}
            {!toggleAjax &&(
            <ul className="productsBar m-0">
                {Object.keys(arrayFiltered).map((key, index) => {
                        return arrayFiltered[key].cat === 'otros' ?
                            <li className="menuImg" tabIndex="0" data-bs-toggle="tooltip"
                                title={arrayFiltered[key].description}
                                key={key} onClick={() => checkIfExist(arrayFiltered[key].title)}>
                                <img alt={arrayFiltered[key].filename} className="m-2"
                                     src={arrayFiltered[key].filename}
                                     width='40' height='40'/>
                                <p>{arrayFiltered[key].title}</p>
                            </li> : null
                    }
                )}
            </ul>
            )}
        </div>
    );
}

export default MenuProducts;
