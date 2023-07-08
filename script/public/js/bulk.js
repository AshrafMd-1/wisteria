$(document).ready(function () {
    const applyBtn = document.getElementById('apply');
    const fromEl = document.getElementById('from');
    const toEl = document.getElementById('to');
    const semEl = document.getElementById('sem');
    const subEl = document.getElementById('sub');
    const formEl = document.getElementById('form');
    const submitBtn = document.getElementById('submit');
    const noEl = document.getElementById('no');
    const uploadEl = document.getElementById('upload');
    const percentEl = document.getElementById('percent');
    const clearAll = () => {
        semEl.innerHTML = '<option value="0">Not Available</option>';
        subEl.innerHTML = '<option value="0">Not Available</option>';
    };

    const showAlert = (message) => {
        swal({
            title: "Error",
            text: message,
            icon: "error",
            button: "Ok",
        })
        clearAll();
    };

    const fetchSemesterData = async () => {
        try {
            const semResponse = await fetch('/semester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roll: fromEl.value
                })
            })
                .then(res => res.json())
                .catch(() => {
                    showAlert('Invalid Roll Number')
                });
            semEl.innerHTML = `<option value="0">Select Semester</option>` + semResponse.map(sem => `<option value="${sem}">${sem}</option>`).join('');
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSubjectData = async () => {
        const sem = semEl.value;
        const roll = fromEl.value;

        if (roll.length === 0) {
            showAlert('Please Enter Roll Number');
            return;
        }

        try {
            const subResponse = await fetch('/subject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roll,
                    sem
                })
            })
                .then(res => res.json())
                .catch(() => {
                    showAlert('Invalid Roll Number')
                })

            const options = subResponse.code.map((code, index) => `<option value="${code}">${subResponse.name[index]}</option>`).join('');
            subEl.innerHTML = `<option value="0">Select Subject</option>${options}`;
        } catch (error) {
            console.log(error);
        }
    };

    const submitForm = async (e) => {
        e.preventDefault();

        const form = new FormData(formEl);
        let from = form.get('from');
        let to = form.get('to');
        const sem = form.get('sem');
        let sub = form.get('sub');
        const week = form.get('week');

        if (from.length === 0 || to.length === 0) {
            showAlert('Please Enter Roll Number');
            return;
        } else if (from.slice(0, 8) !== to.slice(0, 8)) {
            showAlert('Roll Number should be of same batch');
            return;
        } else if (!sem) {
            showAlert('Please Apply Roll Number');
            return;
        } else if (!sub) {
            showAlert('Please Select Semester');
            return;
        } else if (week > 15 || week <= 0) {
            showAlert('Please Enter Week Number Between 1 to 15');
            return;
        }

        from = from.toUpperCase();
        to = to.toUpperCase();
        sub = sub.toUpperCase();

        submitBtn.innerText = 'Loading...';
        submitBtn.disabled = true;

        try {
            const specificResponse = await fetch('/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from,
                    to,
                    sem,
                    sub,
                    week
                })
            })
                .then(res => res.json())
                .catch(() => {
                    showAlert('Invalid Roll Number')
                });
            if (specificResponse && specificResponse.status === 200) {
                specificResponse.data.forEach((item, index) => {
                    if (item.url) {
                        item.url = `<a href="${item.url}" class="link" target="_blank">View</a>`;
                    } else {
                        item.url = `<a href="#" class="link disabled">N/A</a>`;
                    }
                });
                noEl.innerHTML = `<span class="key">Total Students:</span> <span class="value">${specificResponse.data.length}</span>`;
                uploadEl.innerHTML = `<span class="key">Uploaded:</span> <span class="value">${specificResponse.data.filter(item => item.status === 'Uploaded').length}</span>`;
                percentEl.innerHTML = `<span class="key">Percentage:</span> <span class="value">${Math.round((specificResponse.data.filter(item => item.status === 'Uploaded').length / specificResponse.data.length) * 100)}%</span>`;
                document.getElementById('table-header').innerHTML = `
                <tr>
                <th>Roll Number</th>
                <th>Status</th>
                <th>Link</th>
                </tr>`
                $('#myTable').DataTable({
                    data: specificResponse.data,
                    columns: [
                        {data: "roll"},
                        {data: "status"},
                        {data: "url"},
                    ],
                    lengthChange: false,
                    pageLength: 10,
                    searching: false,
                    "bDestroy": true
                });

            }

        } catch (error) {
            console.log(error);
        }

        submitBtn.innerText = 'Submit';
        submitBtn.disabled = false;

    };

    applyBtn.addEventListener('click', async () => {
        if (fromEl.value.length === 0 || toEl.value.length === 0) {
            showAlert('Please Enter Roll Number');
            return;
        } else if (fromEl.value.slice(0, 8) !== toEl.value.slice(0, 8)) {
            showAlert('Roll Number should be of same batch');
            return;
        }

        clearAll();

        applyBtn.innerText = 'Loading...';
        applyBtn.disabled = true;

        await fetchSemesterData();

        applyBtn.innerText = 'Apply';
        applyBtn.disabled = false;
    });

    semEl.addEventListener('change', fetchSubjectData);

    formEl.addEventListener('submit', submitForm);
});