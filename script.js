document.addEventListener("DOMContentLoaded", function() {
    var phoneInput = document.getElementById("phoneInput");
    phoneInput.placeholder = "0 555 555 55 55";
    var sendButton = document.getElementById("send-button");
    var messageDiv = document.querySelector(".toast-body");

    phoneInput.addEventListener("input", function() {
        var rawNumber = this.value.replace(/[^0-9]/g, ""); 
        var formattedNumber = formatPhoneNumber(rawNumber);
        this.value = formattedNumber; 
    });

    sendButton.addEventListener("click", function(event) {
        event.preventDefault(); 

        var adSoyad = document.querySelector("input[name='adSoyad']").value;
        var eposta = document.querySelector("input[name='eposta']").value;
        var telefon = document.querySelector("input[name='telefon']").value;
        var methodName = document.querySelector("input[name='methodName']").value; 
        var konu = document.querySelector("input[name='konu']").value;
        var mesaj = document.querySelector("textarea[name='mesaj']").value;

        var data = new FormData();
        data.append("adSoyad", adSoyad);
        data.append("eposta", eposta);
        data.append("telefon", telefon);
        data.append("methodName", methodName);
        data.append("konu", konu);
        data.append("mesaj", mesaj);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://192.168.1.198/asyaavm-web/", true);  
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Başarılı durum
                    var responseJSON = JSON.parse(xhr.responseText); 
                    var msg = responseJSON.msg;
                    showToastMessage("Mesaj başarıyla gönderildi! Cevap: " + msg, "bg-success");
                } else {
                    // Başarısız durum
                    showToastMessage("Mesaj gönderilirken bir hata oluştu. Hata kodu: " + xhr.status, "bg-danger");
                }
            }
        };
        xhr.send(data);



        
    });
});

function showToastMessage(message, bgColorClass) {
    var toast = document.querySelector(".toast");
    var toastBody = toast.querySelector(".toast-body");
    
    toastBody.textContent = message;
    toast.classList.remove("bg-success", "bg-danger");
    toast.classList.add(bgColorClass);
    
    var bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function formatPhoneNumber(number) {
    var cleaned = ('' + number).replace(/\D/g, '');
    
    if (cleaned.length !== 11) {
        return cleaned;
    }

    var match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);

    if (match) {
        return  match[1] + ' ' + match[2] + ' ' + match[3] + ' ' + match[4] + ' ' + match[5];
    }
    return cleaned;
}
