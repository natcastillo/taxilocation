const listItems = document.querySelectorAll('.list-item');

for(var item of listItems){
    item.addEventListener('click', function(e){
        e.preventDefault();
    })
}