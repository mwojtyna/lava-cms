FROM alpine:3.20.1

WORKDIR /app

ARG DB_CONNECTION=not_set
ENV DB_CONNECTION=${DB_CONNECTION}

RUN apk add postgresql16-client=16.3-r0 --no-cache
COPY ./restore-job.sh /etc/crontabs/root

CMD ["crond", "-f"]
