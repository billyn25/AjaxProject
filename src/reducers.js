export const initialState = {
    data: []
};

export function reducer(state, action) {
    switch (action.type) {
        case "ADD":
            return {
                data:action.payload
            };
        case "ADD_ITEM":
            const newAarryEdit0 = [...state.data,action.payload]
            return {
                data:newAarryEdit0
            };
        case "DELETE":

            const filterArray = state.data.filter(
                (key, index) => index !== action.payload
            );
            return {
                data: filterArray
            };
        case "INCREMENT_AMOUNT":

            const newAarryEdit = [...state.data]
            newAarryEdit[action.payload].amount += 1

            return {
                data: newAarryEdit
            };
        case "DECREMENT_AMOUNT":

            const newArrayEdit2 = [...state.data]

            if (newArrayEdit2[action.payload].amount>1) {
                newArrayEdit2[action.payload].amount = newArrayEdit2[action.payload].amount - 1
            }

            return {
                data: newArrayEdit2
            };
        case "DISCOUNT":

            const newArrayEditDiscount = JSON.parse(JSON.stringify( state.data ));

            newArrayEditDiscount[action.payload.index].discount = action.payload.discount
            return {
                data: newArrayEditDiscount
            };
        default:
            return state;
    }
}
