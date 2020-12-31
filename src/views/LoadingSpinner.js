import React, {Fragment} from 'react';

const LoadingSpinner = () => (
    <Fragment>
        <div className="spinner-border text-light mt-5" role="status" style={{width: "5rem", height: "5rem"}}>
            <span className="sr-only">Loading...</span>
        </div>
        <h5 className="text-white mt-4 mb-3 font-weight-bold">Configurando Panel de Ajax</h5>
    </Fragment>
);

export default LoadingSpinner;
