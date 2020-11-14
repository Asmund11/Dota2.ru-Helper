function save_options () {
    alert("!");
    let a = document.getElementById('cbx')
    a.addEventListener('change', function () {
		if (this.checked) {
            console.log("checked");
        } else {
            console.log("unchecked");
        }
	});
}