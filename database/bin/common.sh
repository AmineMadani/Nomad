#!/bin/bash

log_name=/tmp/${progname}_$(whoami).log

function log () {
    level=$1
    shift
    col=
    case "$level" in
        'ERROR')
            col="\e[31m"
            ;;
        'WARN')
            col="\e[33m"
            ;;
        'INFO')
            col="\e[32m"
            ;;
        'DEBUG')
            col="\e[34m"
            ;;
    esac

    echo -e -n $(date +'%Y-%m-%d %H:%M:%S') " $level $col" | tee -a $log_name
    echo -e -n $* | tee -a $log_name
    echo -e "\e[0m" | tee -a $log_name
}

function logDebug () {
    log DEBUG $*
}

function logInfo () {
    log INFO $*
}

function logWarn () {
    log WARN $*
}

function logError () {
    log ERROR $*
}

function failed() {
    if [ -z "$1" ]
    then
        logError 'Premature end of process: FAILURE!'
    else
        logError "Premature end of process: " $*
    fi

    exit 1
}

function get_version() {
    p=$1
    [ -z "$p" ] && p=$(readlink -m "..")

    
    [ -f $p/metadata.txt ] \
        && version=$(grep 'version=' $p/metadata.txt | cut -d '=' -f 2) \
            || version=
    echo $version
}
