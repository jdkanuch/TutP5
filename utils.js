// Utility functions

// function for dynamic sorting
// // array is sorted by band, in ascending order by default
// bands.sort(compareValues('band'));
//
// // array is sorted by band in descending order
// bands.sort(compareValues('band', 'desc'));
//
// // array is sorted by albums in ascending order
// bands.sort(compareValues('albums'));
function compareValues(key, order='asc') {
    return function (a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
        }

        const varA = (typeof a[key] === 'string') ?
            a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ?
            b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order == 'desc') ? (comparison * -1) : comparison
        );
    }
}

function createMatrix(rowData,columndata){

    var matrixA = [];

    for(i=0;i<rowData.length;i++){
        var sums = [];
        for(j=0;j<columndata.length;j++){
            sums.push(rowData[i]+columndata[j]);
        }
        matrixA.push(sums);
    }
    return matrixA;
    // Math.max(...matrixA[autos.indexOf(42)])
}
