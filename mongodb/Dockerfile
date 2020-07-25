FROM mongo:4.2

# Workaround for this error message:
# https://github.com/docker-library/mongo/issues/323
RUN mkdir -p /home/mongodb && \
      chown -R mongodb:mongodb /home/mongodb

COPY seed/setup.js /docker-entrypoint-initdb.d/
COPY docker-healthcheck /usr/local/bin/

HEALTHCHECK CMD ["docker-healthcheck"]

