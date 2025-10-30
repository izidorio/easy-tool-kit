#!/bin/bash
################################################################################################################
# File					:	get_decrypt_extract.bash
# Usage				:	get_decrypt_extract.bash <GPG Password or Public key> <Input File in CSV format> <Output Directory where archives need to be downloaded>
# Description		:	This script downloads and decrypts extracts supplied by Apple
# Version 			: 	4.0
# The script requires the following installations on the machine:
#					GPG
#					CURL
#					BASH
#
# Release Notes:
# V3.0 : (2022/02/07): Replaced unzip with 7z. For 7z Modified -aoa to -aou to handle the use case when files exist in different archives with the same name.
# V4.0 : (2024/07/23): Support for encrypted password in the URL. Removed archive unzipping.
################################################################################################################

check_prerequisites() {
  # Checking pre-requisites
  all_ok=true

  if ! which gpg >/dev/null
  then
      echo "GPG is not installed. Please refer Apple Bash Script Instructions"
      all_ok=false
  fi

  if ! which curl >/dev/null; then
      echo "CURL is not installed. Please refer Apple Bash Script Instructions"
      all_ok=false
  fi

  if [ $all_ok = false ]
  then
       echo "Prerequisite check failed"
       exit 2
  fi
  #Not checking pre-requisite bash since this script will not run without that!
}

if [ "$1" == "-version" ] || [ "$1" == "-v" ]
then
	echo "Version 4.0"
	exit 2
fi

if [ $# != 3 ]
then
	echo "Usage: $0 <passphrase> <file containing URLs> <output directory>"
	echo "Note: You may need to enclose the parameters in single quotes if they contain spaces or special characters"
	exit 2
fi

# Read the input parameters
PASSPHRASE="$1"
INPUT_FILE="$2"
OUTPUT_DIR="$3"

# Remove the trailing / from output directory path as this causes issue with P7ZIP in Windows
OUTPUT_DIR=$(echo "$OUTPUT_DIR" | sed 's:/*$::')

{
read
  IFS=,
  read -r CATEGORY_READ FILE_NAME_READ URL_READ ENC_TYPE_CODE OTHER_FIELDS
 ENC_TYPE=$(echo $ENC_TYPE_CODE | sed 's/"//g' | tr -d '\r' | tr -d '\n')
} < "$INPUT_FILE"

check_prerequisites $ENC_TYPE

# Type of archives
GPG_ONLY="GPG"
GPG_WITH_ZIP_OLD="GPG_ZIP"
GPG_WITH_ZIP="GPG_ZIP_PWD"
ZIP_WITH_PWD="ZIP_PWD"


# Variables for counting success/failure/others
DOWNLOAD_SUCCESS_COUNT=0
DOWNLOAD_FAILURE_COUNT=0
DECRYPT_SUCCESS_COUNT=0
DECRYPT_FAILURE_COUNT=0
TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE=0

# Error/Success Tracking files
URL_DOWNLOAD_FAILURE_FILE="$OUTPUT_DIR"/$(echo "download_failed_list_"$(date +%Y%m%d%H%M%S)".txt")
DECRYPT_FAILURE_FILE="$OUTPUT_DIR"/$(echo "decrypt_failed_list_"$(date +%Y%m%d%H%M%S)".txt")

{
  read
  while IFS=, read -r CATEGORY_READ FILE_NAME_READ URL_READ ENC_TYPE_CODE OTHER_FIELDS
  do
    TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE=`expr $TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE + 1`

    ##Remove any new line or double quote
    ENC_TYPE=$(echo $ENC_TYPE_CODE | sed 's/"//g' | tr -d '\r' | tr -d '\n')
    FILE_NAME=$(echo $FILE_NAME_READ | sed 's/"//g')
    URL=$(echo $URL_READ | sed 's/"//g')
    CATEGORY=$(echo $CATEGORY_READ | sed 's/"//g')

    #(Uncomment if need to run in debug mode)

    if [ "$ENC_TYPE" == "$GPG_ONLY" ]
    then
      mkdir -p "$OUTPUT_DIR/$CATEGORY"
      curl --progress-bar "$URL"|gpg --batch --yes --pinentry-mode loopback --passphrase "$PASSPHRASE" --decrypt -o "$OUTPUT_DIR/$CATEGORY/$FILE_NAME"
    elif [ "$ENC_TYPE" == "$GPG_WITH_ZIP" -o "$ENC_TYPE" == "$GPG_WITH_ZIP_OLD" -o "$ENC_TYPE" == "$ZIP_WITH_PWD" ]
    then
      FILE_PATH="$OUTPUT_DIR"/$FILE_NAME
      ZIP_FILE_NAME=$(echo "$FILE_NAME" | cut -f 1 -d '.')".zip"
      ZIP_FILE_PATH="$OUTPUT_DIR"/$ZIP_FILE_NAME
      #echo "GPG file path : $FILE_PATH"
      #echo "Zip file path : $ZIP_FILE_PATH"

	  echo "Downloading URL $URL"
      curl --compressed --progress-bar "$URL" -o "$FILE_PATH"  && { echo "$FILE_NAME download success"; DOWNLOAD_SUCCESS_COUNT=`expr $DOWNLOAD_SUCCESS_COUNT + 1`; } || { echo "$FILE_NAME download failed."; DOWNLOAD_FAILURE_COUNT=`expr $DOWNLOAD_FAILURE_COUNT + 1`; echo $URL>> "$URL_DOWNLOAD_FAILURE_FILE"; continue; }
      echo "Finished downloading $URL."
      
      #extract wrapped key if any
	  echo "Extracting wrapped key from URL $URL"
	  URL_WRAPPED_KEY=$(echo "$URL" |cut -s -d'#' -f2)
	  if [ -z "$URL_WRAPPED_KEY" ]
	  then
	 		echo "No wrapped key found for URL $URL"
	  		URL_PASSPHRASE="$PASSPHRASE"
 	  else
		  	 echo "Wrapped key found for URL $URL"
			 URL_PASSPHRASE=$(echo $URL_WRAPPED_KEY | base64 -d | gpg --pinentry-mode loopback --passphrase $PASSPHRASE --decrypt)
	  fi

      if [ "$ENC_TYPE" == "$ZIP_WITH_PWD" ]
      then
        mv "$FILE_PATH" "$ZIP_FILE_PATH"
        echo "Finished moving password protected zip file $ZIP_FILE_PATH to $OUTPUT_DIR"
      else
        echo "Decrypting $FILE_NAME"
        gpg --batch --yes --pinentry-mode loopback --passphrase "$URL_PASSPHRASE"  --output "$ZIP_FILE_PATH" --decrypt "$FILE_PATH"  && { echo "$FILE_NAME GPG decryption success"; DECRYPT_SUCCESS_COUNT=`expr $DECRYPT_SUCCESS_COUNT + 1`; } || { echo "$FILE_NAME GPG decryption failed."; DECRYPT_FAILURE_COUNT=`expr $DECRYPT_FAILURE_COUNT + 1`; echo $FILE_NAME>> "$DECRYPT_FAILURE_FILE"; continue; }
        echo "Finished decrypting $FILE_NAME. "
      fi
    else
      echo "Unknown archive type in the input file: $ENC_TYPE"
    fi
  done
} < "$INPUT_FILE"

if [ $TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE -ne $DECRYPT_SUCCESS_COUNT ]
then
	echo "Process completed with warnings."
	echo "Total no. of files in CSV file - $TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE"
	echo "No. of files downloaded: successful: [$DOWNLOAD_SUCCESS_COUNT], failed [$DOWNLOAD_FAILURE_COUNT]"
	echo "No. of files decrypted: successful: [$DECRYPT_SUCCESS_COUNT], failed [$DECRYPT_FAILURE_COUNT]"
else
	echo "Process completed successfully. $TOTAL_NUMBER_OF_FILES_IN_INPUT_FILE files were downloaded and decrypted."
fi


# Remover todos os arquivos .gpg no diretório de saída
find "$OUTPUT_DIR" -type f -name "*.gpg" -exec rm -f {} \;

echo "Todos os arquivos .gpg foram removidos."

# Exibe mensagem de sucesso. informando o diretório de saída
echo "########################################################################################"
echo "Arquivos decriptografados e salvos em: $OUTPUT_DIR"
echo "########################################################################################"

# Encerrar o terminal
# exit 0