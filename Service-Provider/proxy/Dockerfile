FROM docker.io/httpd:2.4-buster

RUN apt-get update && \
    apt-get install --no-install-recommends -y ca-certificates libapache2-mod-auth-openidc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* \
