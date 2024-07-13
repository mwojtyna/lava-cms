FROM alpine:3.20.1

WORKDIR /app

ARG DB_CONNECTION=not_set
ENV DB_CONNECTION=${DB_CONNECTION}

COPY ./entrypoint.sh entrypoint.sh
RUN apk add postgresql16-client=16.3-r0 --no-cache

CMD ["/bin/sh", "entrypoint.sh"]
