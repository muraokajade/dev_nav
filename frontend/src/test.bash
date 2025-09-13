# プリフライトを直接確認（OPTIONS）
curl -i -X OPTIONS https://chosen-shelba-chokai-engineering-61f48841.koyeb.app/<endpoint> \
  -H "Origin: https://www.devnav.tech" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization"



  curl -i -X OPTIONS "https://chosen-shelba-chokai-engineering-61f48841.koyeb.app/articles" \
  -H "Origin: https://www.devnav.tech" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization"

  curl -i -X OPTIONS "https://chosen-shelba-chokai-engineering-61f48841.koyeb.app/articles" \
  -H "Origin: https://www.devnav.tech" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization"
