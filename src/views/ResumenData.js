import React, {useContext, useEffect, useState} from 'react';
import {MyContext} from "../context";

function ResumenData({data, index, discountLineal, token}) {

    const {dispatch} = useContext(MyContext);
    const {filename, title, description, edit, amount, price, discount} = data

    //resetea el descuento de cada casilla por el descuento lineal
    useEffect(() => {
            dispatch({
                type: "DISCOUNT", payload: {index: index, discount: ''}
            })
        },
        [discountLineal],
    );

    return (
        <React.Fragment>
        <tr className="bg-white border-top">
            <td>
                <img className="imgTable ml-2" src={filename} width='45' height='45'/>
            </td>
            <td className="w-100">
                <h5 className="text-primary">{title}</h5>
                <p className="text-dark">{description}</p></td>
            <td className="text-center">
                <div className="d-inline-flex flex-row">
                    <button hidden={token} type="button" className="btn btnR btn-outline-dark"
                            onClick={() => dispatch({type: "DECREMENT_AMOUNT", payload: index})}><p>-</p>
                    </button>
                    <input className="form-control textNum" type="number" value={amount}/>
                    <button hidden={token} type="button" className="btn btnR btn-outline-dark"
                            onClick={() => dispatch({type: "INCREMENT_AMOUNT", payload: index})}><p>+</p>
                    </button>
                </div>
            </td>
            <td>
                <p className="text-dark text-right">{price.toFixed(2)}</p>
            </td>
            <td className="">
                <input className="form-control textNum"  type="number" min="0" max="100" hidden={discountLineal.length>=1} value={discountLineal!==''?discountLineal:discount}
                       onChange={(e) => dispatch({
                           type: "DISCOUNT", payload: {index: index, discount: e.target.value}
                       })}/>
            </td>
            <td>
                {discountLineal==='' && (<p className="text-dark text-right">{discount ? ((price * ((100 - discount) / 100)) * amount).toFixed(2) : (price * amount).toFixed(2)}</p>)}
                {discountLineal!=='' && (<p className="text-dark text-right">{discountLineal ? ((price * ((100 - discountLineal) / 100)) * amount).toFixed(2) : (price * amount).toFixed(2)}</p>)}
            </td>
            <td id="butdelete" className="text-right">
                {edit !== false && (
                    <React.Fragment>
                        <button hidden={token} id="butdelete" type="button" className="btn btn-lg pl-3"
                                onClick={() => dispatch({type: "DELETE", payload: index})}>
                            <svg width="1.1em" height="1.1em" viewBox="0 0 16 16" className="bi bi-x-square text-danger"
                                 fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                <path fill-rule="evenodd"
                                      d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                        </button>
                    </React.Fragment>)}
            </td>
        </tr>
        </React.Fragment>
    );
}

export default ResumenData;
