async function addGroup() {
    var groupName = document.getElementById("groupname").value;
    var response = await fetch('/add_group', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': groupName
        })
    });
    if (response.ok) {
        window.open('/admin', '_self');
    } else {
        alert('error');
    }
}

async function addKey() {
    var name = document.getElementById('name').value;
    var surname = document.getElementById('surname').value;
    if (document.querySelector('input[name="group"]:checked') != null) {
        var group = document.querySelector('input[name="group"]:checked').value;
    } else {
        return
    }
    var response = await fetch('/add_key', {
                            method: 'POST',
                            headers: {
                                'accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                'name': name,
                                'surname': surname,
                                'group': group
                            })
                        });
    if (response.ok) {
        window.open('/admin', '_self')
    } else {
        alert('error');
    }
}

function download(value) {
    window.open(`download/${value}`)
}

function logout() {
    window.open('admin/login', '_self');
}

async function change_password() {
    var new_pass = document.getElementById("New_pass").value;
    var old_pass = document.getElementById("Old_pass").value;
    var repeat_new_pass = document.getElementById("Repeat_new_pass").value;
    if (new_pass !== repeat_new_pass) {
        document.getElementById("New_pass").classList.add('is-invalid');
        document.getElementById("Repeat_new_pass").classList.add('is-invalid');
        return;
    }
    var response = await fetch(SERVER_DOMAIN + '/change_password', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'new_password': new_pass,
            'old_password': old_pass
        })
    });
}
