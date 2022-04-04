async function getHistoricos(){
    let fechai = document.getElementById('finicial').value 
    let fechaf = document.getElementById('ffinal').value 

    var data = await fetch('/historicos',{
        headers:{
            "Content-Type": "application/json"
        },
        method:'POST',
        body: JSON.stringify({
            finicial: fechai,
            ffinal: fechaf
        })
    })
    return data = data.json()
}